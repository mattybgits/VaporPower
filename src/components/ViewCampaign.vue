<template>
  <div class="ViewCampaign">
    <el-row>
      <el-col :span="8">
    
    <strong>Status:</strong> {{CampaignStatus}}
    
      </el-col>
      <el-col :span="8">
        <h1 style="margin-top:0">{{ipfsReturnedData.name}}</h1>
      </el-col>
      <el-col :span="8">
        <br>
            {{CampaignStatusTime}}<br>
      </el-col>
    </el-row>
    {{ipfsReturnedData.shortDescription}}
    <br>
<br>
<el-progress :text-inside="true" :stroke-width="18" :percentage="timePercentage"></el-progress>
<br>
<el-row>
  <el-col :span="8">
        <img class="preview" :src="ipfsReturnedData.imageData">
        <br>
        <br>
        <el-col :span="24">
          <el-progress type="circle" :percentage="goalPercentage"></el-progress>
          <br>
          goal
        </el-col>
  </el-col>
  <el-col :span="16">
          <el-table
          border
          stripe
          size="small"
          :show-header=false
      :data="tableData"
      style="width: 100%">
      <el-table-column
        prop="propery"
        width="200"
        >
      </el-table-column>
      <el-table-column
        prop="value"
        >
      </el-table-column>
    </el-table></el-col>
</el-row>

      <br>
    <div class="campaignText" v-html="ipfsReturnedData.longDescription"></div>
    
    <h2>Fund Game Campaign</h2>
  
    <el-input-number :disabled="CampaignStatus=='Not Started' || CampaignStatus=='Ended'" v-model="fundingAmount" :precision="2" :step="0.1"></el-input-number> Ether  
    <el-button :disabled="CampaignStatus=='Not Started' || CampaignStatus=='Ended'" @click="fundCurrentCampaign" type="primary">Fund Campaign</el-button>
<br>
<div v-if="isFunder && !failedCampaign">
    <p><strong>You have contributed to this project!</strong> If the campaign has not ended you can reduce your donation. <br> Please not that you can only with reduce your donation if it wont make a passing campaign fail.</p>
    <el-input-number :disabled="CampaignStatus=='Not Started' || CampaignStatus=='Ended'" v-model="reduceAmount" :precision="2" :step="0.1"></el-input-number> Ether  
    <el-button :disabled="CampaignStatus=='Not Started' || CampaignStatus=='Ended'" @click="donerReduceDonationAmount" type="primary">Reduce Donation</el-button>
  </div>

    <div v-if="isFunder && failedCampaign">
    <p><strong>You have contributed to this project!</strong>. However, the campaign has ended and it failed!<br> You can withdraw your donation </p>
    <el-button @click="withdrawFromFailedCampaign" type="primary">Withdraw Donation</el-button>
    </div>

<div v-if="isManager && !failedCampaign">
    <p><strong>You are the manager for this project!</strong> If the campaign has ended and was successful, you can withdraw all the donation funds.</p>
    <el-button :disabled="CampaignStatus!='Ended'" @click="managerWithdrawFromCampaign" type="primary">Withdraw From Campaign</el-button>
  </div>

  <div v-if="isManager && failedCampaign">
    <p><strong>You manage to this project!</strong>. However, the campaign has ended and it failed! </p>
    </div>
</div>
</template>

<script>
import { viewFile } from "../../utils/IPFSUploader";

import {
  loadCampaignManager,
  getNumberOfCampaigns,
  fetchCampaign,
  fundCampaign,
  reduceDonation,
  refundFailedCampaign,
  withdrawCampaignFunds
} from "../../utils/CampaignManagerInterface";

export default {
  name: "ViewCampaign",
  props: {
    campaignID: Number
  },
  data() {
    return {
      //Data returned from the contract is in the followign format as an array:
      // [0-> address manager,
      // 1-> uint startingTime,
      // 2-> uint endingTime,
      // 3-> uint balance,
      // 4-> uint goal,
      // 5-> uint cap,
      // 6-> State state,
      // 7-> address[] donersAddresses,
      // 8-> string ipfsHash]
      contractReturnedData: [],

      // Object that populates ipfsReturnedData is the same as that from CreateNewCampaignTable as
      // {imageData, name, country, shortDescription, date, goalCap, type, longDescription}
      ipfsReturnedData: {},

      CampaignStatus: "", //Stores either: NotStarted, Running, Funded, UnderFunded.
      //same notion as in the contracts but here we need to calculate on the client side to
      //identify things like if: a fund is finished but unclaimed, it will still say Running on chain
      //Data is stored as: d, h, m, s;
      CampaignStatusTime: "",
      fundingAmount: 0,
      isFunder: false,
      isManager: false,
      reduceAmount: 0,
      failedCampaign: false,
      tableData: [],
      timePercentage: 0,
      goalPercentage: 0,
      capPercentage: 0
    };
  },
  methods: {
    async search() {
      this.contractReturnedData = await fetchCampaign(this.campaignID);
      // Note that this subindexing should potentually be done in the campaign manager interface
      // but this extra seperation of conserns will make the process less efficiant. Coupling of layers
      // is worth it here until I can think of a better way to do it while keeping effecient
      console.log("Contract data")
      console.log(this.contractReturnedData)
      this.ipfsReturnedData = await viewFile(this.contractReturnedData[7]);
      console.log(this.ipfsReturnedData)
      //update the display for the time every second
      setInterval(
        function() {
          this.identifyCampaignStatus(this.contractReturnedData);
        }.bind(this),
        1000
      );
      await this.identifyIfContributer();
      await this.identifyIfManager();
      this.generateTable();
    },

    generateTable() {
      let type = "";
      for (let i = 0; i < this.ipfsReturnedData.type.length; i++) {
        type += this.ipfsReturnedData.type[i] + ", ";
      }
      type = type.substring(0, type.length - 2);

      let balance = this.contractReturnedData[3]["c"][0]/10000+" Ether";
      if (balance == undefined || balance == 0) {
        balance = "0 Ether";
      }

      let funders = this.contractReturnedData[6];
      let fundersString = "";
      if (funders == [] || funders == "") {
        fundersString = "None yet...";
      } else {
        for (let i = 0; i < funders.length; i++) {
          funders[i] = funders[i].replace(funders[i].substring(5, 37), "...");
        }
        for (let i = 0; i < funders.length; i++) {
          fundersString += funders[i] + ", ";
        }

        fundersString = fundersString.substring(0, fundersString.length - 2);
      }

      this.date =
        this.ipfsReturnedData.date[0]
          .substring(0, this.ipfsReturnedData.date[0].length - 5)
          .replace("T", " ") +
        " to " +
        this.ipfsReturnedData.date[1]
          .substring(0, this.ipfsReturnedData.date[1].length - 5)
          .replace("T", " ");
      let manager = this.contractReturnedData[0].replace(
        this.contractReturnedData[0].substring(5, 37),
        "..."
      );

      this.tableData = [
        { propery: "Funding Period", value: this.date },
        { propery: "Presale Goal", value: this.ipfsReturnedData.presaleGoal + " Ether" },
        { propery: "Presale Price", value: this.ipfsReturnedData.minPresalePrice + " Ether" },
        { propery: "Mainsale Price", value: this.ipfsReturnedData.minMainsalePrice + " Ether" },
        { propery: "Type", value: type },
        { propery: "Manager", value: manager },
        { propery: "Campaign Balance", value: balance },
        { propery: "Funders", value: fundersString }
      ];
      this.goalPercentage = parseInt(
        this.contractReturnedData[3]["c"][0]/10000 / this.ipfsReturnedData.presaleGoal * 100 / 1000000000000000000);
      this.capPercentage = parseInt(
        this.contractReturnedData[3]["c"][0]/10000 / this.ipfsReturnedData.presaleGoal * 100 / 1000000000000000000);
    },
    convertSeconds(seconds) {
      var d, h, m, s;
      s = parseInt(seconds);
      m = Math.floor(s / 60);
      s = s % 60;
      h = Math.floor(m / 60);
      m = m % 60;
      d = Math.floor(h / 24);
      h = h % 24;
      return { d: d, h: h, m: m, s: s };
    },

    identifyCampaignStatus() {
      let currentTime = new Date() / 1000;
      //Has not started. current time less than the start time
      if (currentTime < this.contractReturnedData[1]) {
        this.CampaignStatus = "Presale Not Started";
        let timeBetween = this.convertSeconds(
          this.contractReturnedData[1] - currentTime
        );
        this.CampaignStatusTime =
          "Campaign Presale Starts in " +
          timeBetween["d"] +
          " days, " +
          timeBetween["h"] +
          " hours, " +
          timeBetween["m"] +
          " minutes and " +
          timeBetween["s"] +
          " seconds";
      }
      //Is running. The current time is more than the start time, but less then the end time
      if (
        currentTime > this.contractReturnedData[1] &&
        currentTime < this.contractReturnedData[2]
      ) {
        this.CampaignStatus = "Running";
        let timeBetween = this.convertSeconds(
          this.contractReturnedData[2] - currentTime
        );
        this.CampaignStatusTime =
          "Campaign Presale ends in " +
          timeBetween["d"] +
          " days, " +
          timeBetween["h"] +
          " hours, " +
          timeBetween["m"] +
          " minutes and " +
          timeBetween["s"] +
          " seconds";
      }
      //Is Over. The current time is more than the end time
      if (currentTime > this.contractReturnedData[2]) {
        this.CampaignStatus = "Ended";
        let timeBetween = this.convertSeconds(
          currentTime - this.contractReturnedData[2]
        );
        this.CampaignStatusTime =
          "Campaign presale ended " +
          +timeBetween["d"] +
          " days, " +
          timeBetween["h"] +
          " hours, " +
          timeBetween["m"] +
          " minutes and " +
          timeBetween["s"] +
          " seconds ago";
      }
      //((currentTime - startTime)/(finalTime - InitalTime))*100

      if (
        currentTime > this.contractReturnedData[1] &&
        currentTime < this.contractReturnedData[2]["c"][0]
      ) {
        this.timePercentage = parseInt(
          (parseInt(currentTime) - this.contractReturnedData[1]["c"][0]) /
            (this.contractReturnedData[2]["c"][0] -
              this.contractReturnedData[1]["c"][0]) *
            100
        );
      }
      if (currentTime < this.contractReturnedData[1]) {
        this.timePercentage = 0;
      }
      if (currentTime > this.contractReturnedData[2]) {
        this.timePercentage = 100;
      }
    },
    async fundCurrentCampaign() {
      await fundCampaign(this.campaignID, this.fundingAmount);
    },
    async identifyIfContributer() {
      if (
        this.contractReturnedData[6].indexOf(
          this.$store.state.defaultEthWallet.toLowerCase()
        ) > -1
      ) {
        this.isFunder = true;
      }
    },
    async identifyIfManager() {
      if (
        this.contractReturnedData[0] ==
        this.$store.state.defaultEthWallet.toLowerCase()
      ) {
        this.isManager = true;
      }
    },
    async identifyIfFailedCampaign() {
      if (
        this.CampaignStatus == "Ended" &&
        this.contractReturnedData[3] < this.contractReturnedData[4]
      ) {
        this.failedCampaign = true;
      }
    },
    async managerWithdrawFromCampaign() {
      await withdrawCampaignFunds(this.campaignID);
    },
    async donerReduceDonationAmount() {
      await reduceDonation(this.campaignID, this.reduceAmount);
    },
    async withdrawFromFailedCampaign() {
      await refundFailedCampaign(this.campaignID);
    }
  },
  async mounted() {
    await loadCampaignManager();
    await this.search();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.campaignText {
  background-color: white;
  border: 1px solid #ddd;
  padding: 5px;
  text-align: center;
}
</style>
