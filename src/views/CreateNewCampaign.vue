<template>
  <div class="CreateNewCampaign">
    <h1> Create a Game funding campaign</h1>
      <CreateNewCampaignTable/>
  </div>
</template>

<script>
// @ is an alias to /src
import CreateNewCampaignTable from "@/components/CreateNewCampaignTable.vue";

export default {
  name: "CreateNewCampaign",
  components: {
    CreateNewCampaignTable
  }
};
</script>

<style>
.contentCard {
  max-width: 1100px;
  /* text-align: center; */
}
</style>

