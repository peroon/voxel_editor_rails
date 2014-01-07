class VoxeldummiesController < ApplicationController
  before_action :set_voxeldummy, only: [:show, :edit, :update, :destroy]

  # GET /voxeldummies
  # GET /voxeldummies.json
  def index
    @voxeldummies = Voxeldummy.all
  end

  # GET /voxeldummies/1
  # GET /voxeldummies/1.json
  def show
  end

  # GET /voxeldummies/new
  def new
    @voxeldummy = Voxeldummy.new
  end

  # GET /voxeldummies/1/edit
  def edit
  end

  # POST /voxeldummies
  # POST /voxeldummies.json
  def create
    @voxeldummy = Voxeldummy.new(voxeldummy_params)

    respond_to do |format|
      if @voxeldummy.save
        format.html { redirect_to @voxeldummy, notice: 'Voxeldummy was successfully created.' }
        format.json { render action: 'show', status: :created, location: @voxeldummy }
      else
        format.html { render action: 'new' }
        format.json { render json: @voxeldummy.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /voxeldummies/1
  # PATCH/PUT /voxeldummies/1.json
  def update
    respond_to do |format|
      if @voxeldummy.update(voxeldummy_params)
        format.html { redirect_to @voxeldummy, notice: 'Voxeldummy was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @voxeldummy.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /voxeldummies/1
  # DELETE /voxeldummies/1.json
  def destroy
    @voxeldummy.destroy
    respond_to do |format|
      format.html { redirect_to voxeldummies_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_voxeldummy
      @voxeldummy = Voxeldummy.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def voxeldummy_params
      params.require(:voxeldummy).permit(:user_id, :title, :data_json)
    end
end
