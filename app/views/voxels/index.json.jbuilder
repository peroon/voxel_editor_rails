json.array!(@voxels) do |voxel|
  json.extract! voxel, :user_id, :title, :data_json
  json.url voxel_url(voxel, format: :json)
end
