Vue.component('opal-user-selector', {
  template: `
          <div class="opal-filter-container">
            <span class="opal-selector-title">Trigger By</span>
            <i-select :value='selectedUser' class="opal-selector" placeholder="select user" @on-change="userChange">
              <i-option v-for="user in users" :key="user" :value="user">{{user}}</i-option>
            </i-select>
          </div>
    `,
  methods: {
    ...Vuex.mapActions({
      getUsers: 'GET_USERS',
      getData: 'GET_DATA'
    }),
    ...Vuex.mapMutations({
      updateSelectedUser: 'UPDATE_SELECTED_USER'
    }),
    userChange(newVal){
      this.updateSelectedUser(newVal);
    },
    fetchMonitoredData() {
      this.selectedUser && this.getData()
    }
  },
  mounted(){
      setInterval(this.fetchMonitoredData,2000);
  },
  computed: Vuex.mapState([
    'users',
    'selectedJob',
    'selectedUser'
  ]),
  watch: {
    selectedJob(){
      this.getUsers()
    },
    selectedUser() {
      this.fetchMonitoredData();
    }
  }

});