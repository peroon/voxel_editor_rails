require 'test_helper'

class VoxeldummiesControllerTest < ActionController::TestCase
  setup do
    @voxeldummy = voxeldummies(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:voxeldummies)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create voxeldummy" do
    assert_difference('Voxeldummy.count') do
      post :create, voxeldummy: { data_json: @voxeldummy.data_json, title: @voxeldummy.title, user_id: @voxeldummy.user_id }
    end

    assert_redirected_to voxeldummy_path(assigns(:voxeldummy))
  end

  test "should show voxeldummy" do
    get :show, id: @voxeldummy
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @voxeldummy
    assert_response :success
  end

  test "should update voxeldummy" do
    patch :update, id: @voxeldummy, voxeldummy: { data_json: @voxeldummy.data_json, title: @voxeldummy.title, user_id: @voxeldummy.user_id }
    assert_redirected_to voxeldummy_path(assigns(:voxeldummy))
  end

  test "should destroy voxeldummy" do
    assert_difference('Voxeldummy.count', -1) do
      delete :destroy, id: @voxeldummy
    end

    assert_redirected_to voxeldummies_path
  end
end
