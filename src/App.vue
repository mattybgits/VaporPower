<template>
  <div class="app">
    

  <el-header class="nav">
      <strong>Address:</strong> {{this.$store.state.defaultEthWallet}} |
      <strong>Network:</strong> {{this.$store.state.netIdString}} |
      <strong>Balance:</strong> {{this.$store.state.walletBalance/1000000000000000000}} Ether 
      <hr>
      <router-link to="/">Home</router-link> |
      <router-link to="/CreateNewCampaign">Create New Game Funding Campaign</router-link> |
      <router-link to="/ViewCampaigns">View All Game Funding Campaigns</router-link> | 
      <router-link to="/ValidateLicence">Validate Licence</router-link>
       <br>
       <hr class="navBarLine">
  </el-header>
  <el-main>
    <router-view class="center"/>
  </el-main>

  </div>
</template>

<style lang="scss">
.app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
.navBarLine {
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
}

.center {
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}
</style>
