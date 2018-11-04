<template>
<el-row>
  <el-col :span="16" :offset="4">
    <el-card class="contentCard">
<div class="CreateNewCampaignTable">
<el-form ref="form" :model="form" label-width="155px">
<el-row :gutter="20">
  <el-col :span="16">
    <el-form-item label="Game name">
    <el-input v-model="form.name"></el-input>
  </el-form-item>
  <el-form-item label="Short Description">
        <el-input type="textarea" v-model="form.shortDescription"></el-input>
  </el-form-item>
  <el-form-item label="Presale dates">
     <div class="block">
    <el-date-picker
      v-model="form.date"
      type="datetimerange"
      range-separator="To"
      start-placeholder="Start date"
      end-placeholder="End date">
    </el-date-picker>
  </div>
  </el-form-item>
  
  </el-col>
  <el-col :span="6">
                Campaign Image
                <input type="file" @change="previewImage" accept="image/*">
            <br>
            <br>
            <div class="image-preview" v-if="form.imageData.length > 0">
                <img class="preview" :src="form.imageData">
            </div>
  </el-col>
</el-row>

  <el-row>
    <el-col class="text-center" :span="24">

<el-form-item label="Game type">
    <el-checkbox-group v-model="form.type">
      <el-checkbox label="Massively Multiplayer Online" name="type"></el-checkbox>
      <el-checkbox label="Simulation" name="type"></el-checkbox>
      <el-checkbox label="Adventure" name="type"></el-checkbox>
      <el-checkbox label="Real-Time Strategy" name="type"></el-checkbox>
      <el-checkbox label="Puzzle" name="type"></el-checkbox>
      <el-checkbox label="Action" name="type"></el-checkbox>
      <el-checkbox label="Stealth Shooter" name="type"></el-checkbox>
      <el-checkbox label="Combat" name="type"></el-checkbox>
      <el-checkbox label="First Person Shooters" name="type"></el-checkbox>
      <el-checkbox label="Sports" name="type"></el-checkbox>
      <el-checkbox label="Role-Playing" name="type"></el-checkbox>
      <el-checkbox label="Educational" name="type"></el-checkbox>
    </el-checkbox-group>
  </el-form-item>
  <el-form-item label="Presale Goal">
     <div class="block">
    <el-row>
      
      <h2 style="margin-top:0px"> {{form.presaleGoal}} Ethers</h2>
      
    </el-row>
    <el-slider
      v-model="form.presaleGoal"
      :min=10
      :max=500
      >
    </el-slider>
  </div>
  </el-form-item>
  
  <el-form-item label="Presale price/licence">
     <div class="block">
    <el-row>
      
      <h2 style="margin-top:0px">  {{form.minPresalePrice}} Ethers</h2>
      
    </el-row>
    <el-slider
      v-model="form.minPresalePrice"
      :min=0.001
      :max=1
      :step=0.001
      >
    </el-slider>
  </div>
  </el-form-item>

    <el-form-item label="Mainsale price/licence">
     <div class="block">
    <el-row>
      
      <h2 style="margin-top:0px">  {{form.minMainsalePrice}} Ethers</h2>
      
    </el-row>
    <el-slider
      v-model="form.minMainsalePrice"
      :min=0.001
      :max=1
      :step=0.001
      >
    </el-slider>
  </div>
  </el-form-item>


<tinymce id="d1" 
            :other_options="tinyOptions" 
            v-model="form.longDescription"
    ></tinymce>
    </el-col>
  </el-row>

<br>
  <el-form-item>
    <el-button type="primary" @click="onSubmit">Create</el-button>
  </el-form-item>
</el-form>  

{{ipfsCreatedAddress}}

</div>
</el-card>
  </el-col>
</el-row>

</template>
<script>
import { uploadFile, viewFile } from "../../utils/IPFSUploader";
import {
  loadCampaignManager,
  createNewCampaign
} from "../../utils/CampaignManagerInterface";

export default {
  name: "CreateNewCampaignTable",
  data() {
    return {
      tinyOptions: {
        height: 300
      },
      form: {
        imageData: "",
        name: "",
        shortDescription: "",
        date: "",
        presaleGoal: 100,
        minPresalePrice:0.01,
        minMainsalePrice:0.05,
        type: [],
        longDescription:
          '<h2 style="color: #339966;">Hi there from EthStarter!</h2> <p>&nbsp;</p> <p><span>You can use this space to design and describe your campaign</span></p>'
      },
      ipfsCreatedAddress: "",
      loadAddress: "",
      retreivedText: ""
    };
  },
  methods: {
    previewImage: function(event) {
      var input = event.target;
      if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = e => {
          this.form.imageData = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
      }
    },
    async onSubmit() {
      let createdAddress = await uploadFile(this.form);
      let startTime = Math.floor(Date.parse(this.form.date[0]) / 1000);
      let endTime = Math.floor(Date.parse(this.form.date[1]) / 1000);
      let presaleGoal = this.form.presaleGoal;
      let presaleCostPerToken = this.form.minPresalePrice;
      let mainSaleCostPerToken = this.minMainsalePrice;
      let campaignTx = await createNewCampaign(
        startTime,
        endTime,
        presaleGoal,
        createdAddress,
        presaleCostPerToken,
        mainSaleCostPerToken,
      );
    },
    async loadHash() {
      let returnedValue = await viewFile(this.$data.loadAddress);
      this.$data.retreivedText = returnedValue;
    }
  },
  async mounted(){
    await loadCampaignManager()
  }
};
</script>

<style>
img.preview {
  width: 250px;
  background-color: white;
  border: 1px solid #ddd;
  padding: 5px;
  text-align: center;
}
</style>
