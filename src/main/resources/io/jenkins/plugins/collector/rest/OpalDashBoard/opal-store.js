const store = new Vuex.Store({
  state: {
    users: [],
    jobs: [],
    dateRange: [new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), new Date()],
    selectedJob: '',
    selectedUser: '',
    data: null,
  },
  getters: {
    skipToJobDetailEvent: ({selectedJob}) => {
      return (param) => {
        let data = JSON.parse(param.name);
        window.open(window.location.href.replace("opal", "job/") + selectedJob + "/" + data.id);
      }
    },
    lineChartItems: ({data}) => {
      data = data ? data : BUILD_DATA;
      let recoveryTimeData = data.buildInfos.filter(data => data.recoveryTime !== null);
      let leadTimeData = data.buildInfos.filter(data => data.leadTime !== null);
      let durationData = data.buildInfos.filter(data => data.duration !== null);
      return [{
        id:"opal-recovery-time-chart",
        name: "Recovery Time",
        option:lineChartOptionGenerator('Recovery Time', recoveryTimeData, "Recovery Time", "End Time", "recoveryTime", lineChartToolTipFormat("End Time", "Recovery Time"))
      },{
        id:"opal-lead-time-chart",
        name: "Lead Time",
        option: lineChartOptionGenerator('Lead Time', leadTimeData, "Lead Time", "End Time", "leadTime", lineChartToolTipFormat("End Time", "Lead Time"))
      },{
        id:"opal-duration-chart",
        name: "Duration",
        option: lineChartOptionGenerator('Duration', durationData, "Duration", "End Time", "duration", durationToolTipFormat("End Time", "Duration")),
        clickEvent: 'skipToJobDetailEvent'
      },{
        id:"opal-build-distribution-chart",
        name: "Build Distribution",
        option:deployTimeDistributionChartOptionGenerator(data)
      }]
    },
    gaugeChartItems: ({data}) => {
      data = data ? data : BUILD_DATA;
      return [{
        id:"failure-rate-chart",
        name: "Failure Rate",
        option:gagueChartOptionGenerator("Failure Rate", (data.failureRate * 100).toFixed(2), "{value}%", 'Failure Rate', '{a} <br/>{b} : {c}%',
            [[0.1, '#91c7ae'], [0.3, '#FFA500'], [0.5, '#c23531'], [1, '#990077']], 100, value => value)
      },{
        id:"deploy-frequency-chart",
        name: "Deploy Frequency",
        option: gagueChartOptionGenerator("Deploy Frequency", data.deploymentFrequency, "{value}", 'Deploy Frequency', '{a} <br/>{b} : {c}',
            [[0.1, '#c23531'], [0.8, '#63869e'], [1, '#91c7ae']], 200, value => value === 200 ? value + "+" : value)
      }]
    }
  },
  mutations: {
    'GET_USERS_SUCCESS': (state, payload) => {
      state.users = ['All users', ...payload];
      state.selectedUser = 'All users'
    },
    'GET_JOBS_SUCCESS': (state, payload) => {
      state.jobs = payload;
      state.selectedJob = payload[0]
    },
    'GET_DATA_SUCCESS': (state, playload) => state.data = playload,
    'UPDATE_SELECTED_USERS': (state, playload) => {
      state.users = playload;
      state.selectedUser = playload[0];
    },
    'UPDATE_DATE_RANGE': (state, playload) => {
      state.dateRange = playload;
    },
    'UPDATE_SELECTED_USER': (state, playload) => {
      state.selectedUser = playload;
    },
    'UPDATE_SELECTED_JOB': (state, playload) => {
      state.selectedJob = playload;
    }
  },
  actions: {
    'GET_USERS': ({commit, state}) => {
      let param = {
        jobName: state.selectedJob,
      };
      $.get("http://localhost:8080/jenkins/opal/users", param, function (data, status) {
        if (status === 'success') {
          commit("GET_USERS_SUCCESS", data);
        }
      })
    },
    'GET_JOBS': ({commit}) => {
      $.get("http://localhost:8080/jenkins/opal/jobs", function (data, status) {
        if (status === 'success') {
          commit("GET_JOBS_SUCCESS", data);
        }
      })
    },
    'GET_DATA': ({commit, state}) => {
      let param = {
        jobName: state.selectedJob,
        beginTime: new Date(state.dateRange[0].toLocaleDateString()).getTime(),
        endTime: new Date(state.dateRange[1].toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1,
        triggerBy: state.selectedUser
      };
      $.get("http://localhost:8080/jenkins/opal/data", param, function (data, status) {
        if (status === 'success') {
          commit("GET_DATA_SUCCESS", data);
        }
      })
    },
  }
});