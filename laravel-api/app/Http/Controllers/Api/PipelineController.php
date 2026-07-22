<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pipeline;
use App\Models\PipelineStage;
use App\Models\Deal;
use Illuminate\Http\Request;

class PipelineController extends Controller
{
    public function index()
    {
        $pipelines = Pipeline::with('stages.deals')->where('is_active', true)->get();
        return response()->json($pipelines);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $pipeline = Pipeline::create([
            'name' => $request->name,
            'slug' => \Illuminate\Support\Str::slug($request->name),
            'description' => $request->description,
            'created_by' => $request->user()->id,
        ]);

        $defaultStages = ['New Lead', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
        foreach ($defaultStages as $i => $stageName) {
            PipelineStage::create([
                'pipeline_id' => $pipeline->id,
                'name' => $stageName,
                'slug' => \Illuminate\Support\Str::slug($stageName),
                'sort_order' => $i,
                'probability' => ($i + 1) * 14,
                'is_won' => $stageName === 'Closed Won',
                'is_lost' => $stageName === 'Closed Lost',
            ]);
        }

        return response()->json($pipeline->load('stages'), 201);
    }

    public function show($id)
    {
        $pipeline = Pipeline::with('stages.deals.lead')->findOrFail($id);
        return response()->json($pipeline);
    }

    public function update(Request $request, $id)
    {
        $pipeline = Pipeline::findOrFail($id);
        $pipeline->update($request->only(['name', 'description', 'is_active']));
        return response()->json($pipeline);
    }

    public function destroy($id)
    {
        Pipeline::findOrFail($id)->delete();
        return response()->json(['message' => 'Pipeline deleted']);
    }

    public function storeStage(Request $request, $pipelineId)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $pipeline = Pipeline::findOrFail($pipelineId);
        $stage = PipelineStage::create([
            'pipeline_id' => $pipeline->id,
            'name' => $request->name,
            'slug' => \Illuminate\Support\Str::slug($request->name),
            'color' => $request->get('color', '#0A2647'),
            'sort_order' => PipelineStage::where('pipeline_id', $pipeline->id)->max('sort_order') + 1,
            'probability' => $request->get('probability', 50),
        ]);
        return response()->json($stage, 201);
    }

    public function storeDeal(Request $request, $pipelineId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'stage_id' => 'required|exists:pipeline_stages,id',
            'value' => 'nullable|numeric',
            'lead_id' => 'nullable|exists:leads,id',
            'contact_id' => 'nullable|exists:contacts,id',
        ]);

        $deal = Deal::create([
            'pipeline_id' => $pipelineId,
            'stage_id' => $request->stage_id,
            'title' => $request->title,
            'value' => $request->get('value', 0),
            'lead_id' => $request->lead_id,
            'contact_id' => $request->contact_id,
            'assigned_to' => $request->get('assigned_to', $request->user()->id),
            'expected_close_date' => $request->expected_close_date,
        ]);

        return response()->json($deal->load('stage'), 201);
    }

    public function moveDeal(Request $request, $pipelineId, $dealId)
    {
        $request->validate(['stage_id' => 'required|exists:pipeline_stages,id']);
        $deal = Deal::where('pipeline_id', $pipelineId)->findOrFail($dealId);
        $deal->update(['stage_id' => $request->stage_id]);

        $stage = PipelineStage::find($request->stage_id);
        if ($stage && $stage->is_won) {
            $deal->update(['status' => 'won', 'closed_at' => now()]);
        } elseif ($stage && $stage->is_lost) {
            $deal->update(['status' => 'lost', 'closed_at' => now()]);
        }

        return response()->json($deal->fresh()->load('stage'));
    }

    public function destroyDeal($pipelineId, $dealId)
    {
        Deal::where('pipeline_id', $pipelineId)->findOrFail($dealId)->delete();
        return response()->json(['message' => 'Deal deleted']);
    }
}
