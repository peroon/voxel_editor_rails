require 'test_helper'

class VoxelsControllerTest < ActionController::TestCase
  setup do
    @voxel = voxels(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:voxels)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create voxel" do
    assert_difference('Voxel.count') do
      post :create, voxel: { data_json: @voxel.data_json, title: @voxel.title, user_id: @voxel.user_id }
    end

    assert_redirected_to voxel_path(assigns(:voxel))
  end

  test "should show voxel" do
    get :show, id: @voxel
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @voxel
    assert_response :success
  end

  test "should update voxel" do
    patch :update, id: @voxel, voxel: { data_json: @voxel.data_json, title: @voxel.title, user_id: @voxel.user_id }
    assert_redirected_to voxel_path(assigns(:voxel))
  end

  test "should destroy voxel" do
    assert_difference('Voxel.count', -1) do
      delete :destroy, id: @voxel
    end

    assert_redirected_to voxels_path
  end
end
