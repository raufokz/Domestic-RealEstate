<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validation for the single-payload listing write.
 *
 * Handles both create and update: on update every core field becomes optional
 * (`sometimes`) so a caller can PATCH one field without resending the listing.
 *
 * Privileged fields are validated but NOT authorised here — PropertyWriteService
 * strips them for non-staff. Validation says "this value is well-formed";
 * the policy says "you may set it". Keeping those separate means a stray
 * `featured` in an agent's form post is ignored rather than throwing a 422.
 */
class PropertyWriteRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Route middleware + PropertyPolicy own authorisation.
        return true;
    }

    private function isCreate(): bool
    {
        return $this->isMethod('POST') && !$this->route('id');
    }

    public function rules(): array
    {
        $req = $this->isCreate() ? 'required' : 'sometimes';

        return [
            // ---- core ----
            'title' => [$req, 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:20000'],
            'price' => [$req, 'numeric', 'min:0', 'max:999999999'],
            'original_price' => ['nullable', 'numeric', 'min:0', 'max:999999999'],
            'property_type_id' => ['nullable', 'integer', 'exists:property_types,id'],
            'sub_type' => ['nullable', 'string', 'max:100'],

            'price_type' => ['sometimes', Rule::in(['sale', 'rent', 'lease', 'off_market'])],
            'status' => ['sometimes', Rule::in([
                'draft', 'active', 'pending', 'under_contract', 'sold', 'expired', 'withdrawn', 'archived',
            ])],
            'approval_status' => ['sometimes', Rule::in(['draft', 'pending', 'approved', 'rejected'])],

            // ---- specs ----
            'bedrooms' => ['nullable', 'integer', 'min:0', 'max:100'],
            'bathrooms' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'half_bathrooms' => ['nullable', 'integer', 'min:0', 'max:100'],
            'sqft' => ['nullable', 'integer', 'min:0', 'max:10000000'],
            'lot_size' => ['nullable', 'numeric', 'min:0'],
            'year_built' => ['nullable', 'integer', 'min:1600', 'max:'.(date('Y') + 5)],
            'floors' => ['nullable', 'integer', 'min:0', 'max:200'],
            'parking_spaces' => ['nullable', 'integer', 'min:0', 'max:100'],
            'hoa_fees' => ['nullable', 'numeric', 'min:0'],
            'property_taxes_annual' => ['nullable', 'numeric', 'min:0'],

            // ---- location ----
            'address' => [$req, 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city' => [$req, 'string', 'max:120'],
            'state' => [$req, 'string', 'max:60'],
            'zip' => [$req, 'string', 'max:20'],
            'county' => ['nullable', 'string', 'max:120'],
            'country' => ['sometimes', 'string', 'size:2'],
            'neighborhood' => ['nullable', 'string', 'max:120'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],

            // ---- flags (stripped for non-staff by the service) ----
            'featured' => ['sometimes', 'boolean'],
            'premium' => ['sometimes', 'boolean'],
            'is_verified' => ['sometimes', 'boolean'],
            'realtor_id' => ['sometimes', 'integer', 'exists:users,id'],
            'broker_id' => ['nullable', 'integer', 'exists:users,id'],

            // ---- misc ----
            'virtual_tour_url' => ['nullable', 'url', 'max:2048'],
            'video_url' => ['nullable', 'url', 'max:2048'],
            'open_house_date' => ['nullable', 'date'],
            'open_house_end' => ['nullable', 'date', 'after_or_equal:open_house_date'],

            'amenities' => ['sometimes', 'array', 'max:100'],
            'amenities.*' => ['string', 'max:80'],

            // ---- media, all in the same payload ----
            'media' => ['sometimes', 'array'],
            'media.add' => ['sometimes', 'array', 'max:60'],
            'media.add.*.file_url' => ['required_with:media.add', 'string', 'max:2048'],
            'media.add.*.public_id' => ['nullable', 'string', 'max:255'],
            'media.add.*.media_type' => ['nullable', Rule::in(['image', 'floor_plan', 'video'])],
            'media.add.*.caption' => ['nullable', 'string', 'max:255'],
            'media.add.*.display_order' => ['nullable', 'integer', 'min:0'],

            // ids to detach; ownership is re-checked in the service
            'media.remove' => ['sometimes', 'array', 'max:60'],
            'media.remove.*' => ['integer'],

            'media.order' => ['sometimes', 'array', 'max:200'],
            'media.order.*' => ['integer'],

            'media.cover_id' => ['nullable', 'integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'media.add.*.file_url.required_with' => 'Every uploaded image needs a file_url.',
            'open_house_end.after_or_equal' => 'The open house cannot end before it starts.',
            'year_built.max' => 'Year built cannot be more than five years in the future.',
        ];
    }
}
