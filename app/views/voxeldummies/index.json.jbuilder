json.array!(@voxeldummies) do |voxeldummy|
  json.extract! voxeldummy, :user_id, :title, :data_json
  json.url voxeldummy_url(voxeldummy, format: :json)
end
