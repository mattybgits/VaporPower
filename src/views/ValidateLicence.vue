<template>
  <div class="home">
    <h1>Are you a winner?!</h1>
    <br>
    <el-button type="primary" @click="validate">Am I registered with a licence?</el-button>
    <br>
    Number of Licenses for game {{returnVerifyState}}
  </div>
</template>

<script>
// @ is an alias to /src
import {loadCampaignManager, validateLicence} from "../../utils/CampaignManagerInterface";

export default {
  name: 'home',
  data(){
    return {
      returnVerifyState: 0
    }
  },
  methods:{
      async validate(){
          console.log("Validating licence...")
         this.returnVerifyState =  await validateLicence(0);
         console.log(this.returnVerifyState)
      }
  },
  async mounted() {
     await loadCampaignManager();  
  }
}

</script>

