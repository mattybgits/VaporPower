<template>
  <div class="home">
    <h1>Welcome to Vapor Market!</h1>
    <br>
    <img alt="Vue logo" src="../assets/trophy-solid.svg" style="width:250px">
    <HelloWorld class="center"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'home',
  components: {
    HelloWorld
  }
}
</script>

