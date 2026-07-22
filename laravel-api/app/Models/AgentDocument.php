<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentDocument extends Model
{
    use HasFactory;

    protected $fillable = ['agent_id', 'document_type', 'file_url', 'original_name', 'uploaded_at', 'status'];

    public function agent() { return $this->belongsTo(AgentProfile::class, 'agent_id'); }
}
