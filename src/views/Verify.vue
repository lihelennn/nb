<template>
  <div class="app-wrapper">
    <nav-bar></nav-bar>
    <div class="app-body">
      {{message}}
    </div>
  </div>
</template>

<script>
  import axios from "axios"
  import NavBar from '../components/NavBar.vue'

  export default {
    name: "verify-page",
    props: {
      verification_id: String,
    },
    data() {
      return {
        message: "",
      }
    },
    mounted:  function() {
      axios.put("api/users/verify", {verification_id: this.verification_id})
      .then(() => {
        this.setMessage("You account has been verified. Please login here or close this page.");
      })
      .catch(() => {
        this.setMessage("A problem was encountered when trying to verify account. Please contact us at nb@mit.edu.")
      })
    },
    methods: {
      setMessage: function(msg) {
        this.message = msg;
      },
    },
    components: {
      NavBar,
    },
  }
</script>

<style scoped>
  .app-wrapper {
    height: 100%;
  }
  .app-body {
    width: 100%;
    height: calc(100vh - var(--navbar-height) - 80px);
    padding: 40px 0;
    display: flex;
    justify-content: space-around;
  }
  .v-divide {
    width: 0;
    height: 100%;
    border: solid 1px #aaa;
  }
</style>
