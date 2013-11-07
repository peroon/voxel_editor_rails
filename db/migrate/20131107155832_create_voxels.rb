class CreateVoxels < ActiveRecord::Migration
  def change
    create_table :voxels do |t|
      t.integer :user_id
      t.string :title
      t.text :data_json

      t.timestamps
    end
  end
end
