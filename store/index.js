'use strict';

Vue.prototype.$http = axios;

const store = new Vuex.Store({
  state: {
    notification: {
      active: true,
      text: null,
      timer: null
    },
    loading: {
      active: true
    },
    map: null,
    geocoder: null,
    legend: null,
    customOverlay: [],
    circle: null,
    radius: 200,
    marker: {
      myPosLat: null,
      myPosLng: null,
      myPosMarkImage: null,
      myPosMarker: null,
      activeIndex: null
    },
    markFilterSList: [false, false, false, false, false],
    maskStateColor: [true, false, false, false, false],
    collActive: true,
    panel: {
      panelActive: true,
      panelFocusState: false
    },
    pharIList: [],
    infoPanelActive: false,
    pharData: {
      dutyState: "정보없음",
      dutyTime: "정보없음",
      name: "정보없음",
      lat: null,
      lng: null,
      phoneNumber: "정보없음",
      address: "정보없음",
      updateTime: "정보없음",
      remainMaskCount: "정보없음",
      stockTime: "정보없음"
    },
    availDay: [false, false, false, false, false, false, false]
  },
  mutations: {
    notihide: function(state) {
      console.log("Hide notification")
      state.notification.active = true;
      window.clearTimeout(state.notification.timer);
    },
    loadActivate: function(state) {
      console.log("Activate map loading state");
      state.loading.active = true;
    },
    loadDeactivate: function(state) {
      console.log("Deactivate map loading state");
      state.loading.active = false;
    },
    circleRemove: function(state) {
      console.log("Remove circle")
      if(state.circle != null) state.circle.setMap(null);
    },
    setActiveMarkIndex: function(state, payload) {
      console.log("Set active marker index");
      if(payload.index != null) state.marker.activeIndex = payload.index;
    },
    activeMarkIndexRemove: function(state) {
      console.log("Remove active marker index");
      state.marker.activeIndex = null;
    },
    panelFocus: function(state) {
      console.log("Focus Panel");
      if($(window).width() < 768) {
        if(!state.panel.panelFocusState) state.panel.panelFocusState = true;
      }
    },
    panelBlur: function(state, payload) {
      console.log("Add panel blur event");
      if($(window).width() < 768) {
        if(state.panel.panelFocusState) state.panel.panelFocusState = false;
      }
    },
    panelActivate: function(state, payload) {
      console.log("Activate panel");
      if(payload.state == "force") {
        state.panel.panelActive = true;
      } else {
        state.panel.panelActive = !state.panel.panelActive;
      }
    },
    maskStateColorSet: function(state) {
      console.log("Set mask state color")
      let remainMaskCount = state.pharData.remain_stat;
      state.maskStateColor = [false, false, false, false, false];
      if(state.pharData.dutyStateValue == "영업종료" || state.pharData.dutyState == "판매중지") {
        Vue.set(state.maskStateColor, 0, true);
      } else {
        if(remainMaskCount == "0 ~ 1") {
          Vue.set(state.maskStateColor, 1, true);
        } else if(remainMaskCount == "2 ~ 30") {
          Vue.set(state.maskStateColor, 2, true);
        } else if(remainMaskCount == "30 ~ 100") {
          Vue.set(state.maskStateColor, 3, true);
        } else if(remainMaskCount == "100+") {
          Vue.set(state.maskStateColor, 4, true);
        } else {
          Vue.set(state.maskStateColor, 0, true);
        }
      }
    },
    markFilter: function(state) {
      console.log("Filter marker");
      for(var i = 0; i < state.markFilterSList.length; i++) {
        if(state.markFilterSList[i]) {
          $(`.custom-overlay-state${i}`).removeClass("d-flex").addClass("d-none");
        }
      }
    },
    collBoxHide: function(state) {
      $("#collapse-box").collapse("hide");
    },
    pharIListRemove: function(state) {
      console.log("Remove all pharmacy data")
      state.pharIList = [];
    },
    infoPanelActivate: function(state) {
      console.log("Activate information panel")
      if(state.pharIList.length != 0) {
        store.commit("collBoxHide");
        
        state.infoPanelActive = true;
      }
    },
    customORemove: function(state) {
      console.log("Remove custom overlay");
      state.customOverlay.forEach(ele => {
        ele.setMap(null);
      })
    },
    availDaySet: function(state) {
      let date = new Date();
      let day = date.getDay()

      state.availDay = [false, false, false, false, false, false];
      if(day == 0 || day == 6) {
        Vue.set(state.availDay, 0, true);
      } else if(day == 1) {
        Vue.set(state.availDay, 1, true);
      } else if(day == 2) {
        Vue.set(state.availDay, 2, true);
      } else if(day == 3) {
        Vue.set(state.availDay, 3, true);
      } else if(day == 4) {
        Vue.set(state.availDay, 4, true);
      } else if(day == 5) {
        Vue.set(state.availDay, 5, true);
      }
    }
  },
  actions: {
    notiShow: function({ commit, state }, payload) {
      console.log("Show notification");
      state.notification.text = payload.text;
      state.notification.active = false;
      state.notification.timer = window.setTimeout(() => {
        commit("notihide");
      }, 700);
    },
    myPosSet: function({ dispatch, commit, state }) {
      console.log("Set my position");
      commit("panelBlur");

      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          dispatch("markDragRemove");

          console.log("- Move my position");
          state.marker.myPosLat = pos.coords.latitude;
          state.marker.myPosLng = pos.coords.longitude;
          state.map.setCenter(new kakao.maps.LatLng(state.marker.myPosLat, state.marker.myPosLng));
          state.map.setLevel(3);

          dispatch("customOAdd");

          console.log("- Set my position marker");
          state.marker.myPosMarker.setMap(null);
          state.marker.myPosMarker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(state.marker.myPosLat, state.marker.myPosLng), 
            image: state.marker.myPosMarkImage,
            draggable: true
          });
          state.marker.myPosMarker.setMap(state.map);

          dispatch("markDragAdd");
        });
      }
    },
    radiusChange: function({ dispatch, commit, state }, payload) {
      state.radius = payload.radius;

      dispatch("customOAdd");
    },
    circleAdd: function({ commit, state }) {
      console.log("Add circle");
      commit("circleRemove")
      
      state.circle = new kakao.maps.Circle({
        center: new kakao.maps.LatLng(state.marker.myPosLat, state.marker.myPosLng),
        radius: state.radius,
        strokeWeight: 1,
        strokeColor: "#00a0e9",
        strokeOpacity: 0.1,
        strokeStyle: "solid",
        fillColor: "#00a0e9",
        fillOpacity: 0.2
      });
      state.circle.setMap(state.map);
    },
    markDragAdd: function({ dispatch, state }) {
      console.log("Add marker drag event");
      kakao.maps.event.addListener(state.marker.myPosMarker, "dragend", () => {
        let markPosition = state.marker.myPosMarker.getPosition();
        state.marker.myPosLat = markPosition.getLat();
        state.marker.myPosLng = markPosition.getLng();

        dispatch("customOAdd");
      });
    },
    markDragRemove: function({ state }) {
      console.log("Remove marker drag event");
      kakao.maps.event.removeListener(state.marker.myPosMarker, "dragend");
    },
    markClickUpdate: function({ dispatch, commit, state }) {
      console.log("Click marker update event")
      kakao.maps.event.addListener(state.map, "click", (e) => {
        commit("collBoxHide");
        
        if(!state.loading.active) {
          let position = e.latLng;
          state.marker.myPosLat = position.Ha;
          state.marker.myPosLng = position.Ga;

          dispatch("markDragRemove");

          state.marker.myPosMarker.setMap(null);
          state.marker.myPosMarker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(state.marker.myPosLat, state.marker.myPosLng), 
            image: state.marker.myPosMarkImage,
            draggable: true
          });

          state.marker.myPosMarker.setMap(state.map);

          dispatch("markDragAdd");

          dispatch("customOAdd");
        }
      });
    },
    customOAdd: function({ dispatch, commit, state }) {
      console.log("Add custom overlay");

      commit("loadActivate");

      commit("activeMarkIndexRemove");

      commit("customORemove");

      dispatch("circleAdd")

      console.log("- Call \"getPharData\" API");
      state.geocoder.coord2RegionCode(state.marker.myPosLng, state.marker.myPosLat, (result, status) => {
        axios.post("/getPharData", {
          address: result[0],
          posLat: state.marker.myPosLat,
          posLng: state.marker.myPosLng,
          radius: state.radius,
        }, {
          headers: { "content-type": "application/json" }
        }).then(res => {
          let data = res.data;
          if(data.length != 0) {
            commit("pharIListRemove");

            data.forEach((ele, index) => {
              let remainMaskCount = ele.remain_stat;
              let overlayColor = null;
              let textColor = null;
              let markState = null;
              if(ele.dutyStateValue == "영업종료") {
                overlayColor = "bg-dark";
                textColor = "text-muted"
                markState = 0;
              } else {
                if(remainMaskCount == "0 ~ 1") {
                  overlayColor = "bg-secondary";
                  textColor = "text-white";
                  markState = 1;
              } else if(remainMaskCount == "2 ~ 30") {
                  overlayColor = "bg-danger";
                  textColor = "text-white";
                  markState = 2;
                } else if(remainMaskCount == "30 ~ 100") {
                  overlayColor = "bg-warning";
                  textColor = "text-dark";
                  markState = 3;
                } else if(remainMaskCount == "100+") {
                  overlayColor = "bg-success";
                  textColor = "text-white";
                  markState = 4;
                } else {
                  overlayColor = "bg-dark";
                  textColor = "text-white"
                  markState = 0;
                }
              }
              let content = `
                <div class="custom-overlay custom-overlay${index} custom-overlay-state${markState} d-flex pl-1 pr-1 ${overlayColor} ${textColor} border border-light rounded"
                data='${JSON.stringify(ele)}' index="${index}">
                  <div class="mr-1">
                    <small>${ele.name}</small>
                  </div>
                  <div> 
                    <small>
                      <span>·<span>
                      <strong>${ele.remain_stat}</strong>
                    </small>
                  </div>
                </div>
              `;
              if(ele.lat != undefined && ele.lng != undefined) {
                state.customOverlay.push(new kakao.maps.CustomOverlay({
                  map: state.map,
                  position: new kakao.maps.LatLng(ele.lat, ele.lng),
                  content: content,
                  clickable : true
                }))
              }
              if(index == data.length - 1) {
                commit("loadDeactivate");

                commit("markFilter");
              }

              dispatch("pharIListAdd", {
                data: ele,
                index: index
              })
            });
          } else {
            commit("loadDeactivate");
          }
        })
      })
    },
    activeMarkChange: function({ dispatch, commit, state }, payload) {
      console.log("Change custom active marker");
      if(payload != null) commit("setActiveMarkIndex", { index: payload.index })
      
      let data = payload.data;
      if($(window).width() < 768) {
        state.map.setLevel(3);
        state.map.setCenter(new kakao.maps.LatLng(data.lat - 0.0015, data.lng));
      } else {
        state.map.setCenter(new kakao.maps.LatLng(data.lat, data.lng));
      }
      
      dispatch("activeMarkFocus");
    },
    activeMarkFocus: function({ commit, state }) {
      console.log("Focus active marker")
      let customOverlay = $(".custom-overlay");
      customOverlay.removeClass("active");
      $(`.custom-overlay${state.marker.activeIndex}`).addClass("active");
      customOverlay.parent().css("z-index", "0");
      $(`.custom-overlay${state.marker.activeIndex}`).parent().css("z-index", "9999");
    },
    customOClick: function({ commit, dispatch }) {
      console.log("Add custom overlay click");
      let _commit = commit;
      $("#map").on("click", ".custom-overlay", function(e) {
        let index = parseInt($(this).attr('index'));

        _commit("panelFocus");

        _commit("collBoxHide");

        $(".custom-overlay").removeClass("active");
        $(this).addClass("active");
        
        _commit("panelActivate", {
          state: "force"
        });

        dispatch("pharInfoUpdate", {
          data: $(this).attr("data"),
          index: index
        })
      })
    },
    zoomChange: function({ dispatch, commit, state }) {
      console.log("Add map zoom change event");
      kakao.maps.event.addListener(state.map, "zoom_changed", () => {
        commit("markFilter");

        dispatch("activeMarkFocus");
      });
    },
    panChange: function({ dispatch, commit, state }) {
      console.log("Add map pan change event")
      kakao.maps.event.addListener(state.map, 'dragend', function() {
        commit("markFilter");

        dispatch("activeMarkFocus");
      });
    },
    pharInfoDetailOpen: function({ commit }) {
      console.log("Show pharmacy detail panel");

      commit("infoPanelActivate");

      $(".tab-pane").each(function() {
        $(this).removeClass("show").removeClass("active");
      })
      $("#phar-detail").addClass("show").addClass("active");

      $("#aside-box").scrollTop('0');
    },
    pharIListAdd: function({ state }, payload) {
      console.log("Add pharmacy data");
      state.pharIList[payload.index] = payload.data;
    },
    pharInfoUpdate: function({ dispatch, commit, state }, payload) {
      console.log("Update pharmacy data");

      dispatch("pharInfoDetailOpen");

      let data = null;
      if(typeof(payload.data) == 'string') {
        data = JSON.parse(payload.data);
      } else {
        data = payload.data;
      }

      dispatch("activeMarkChange", { data: data, index: payload.index });
      
      state.pharData.dutyTime = data.dutyTime;
      state.pharData.stock_at = data.stock_at;
      state.pharData.dutyState = data.dutyState;
      state.pharData.dutyStateValue = data.dutyStateValue;
      state.pharData.lat = data.lat;
      state.pharData.lng = data.lng;
      state.pharData.name = data.name;
      state.pharData.address = data.address;
      state.pharData.phoneNumber = data.phoneNumber;
      state.pharData.remain_stat = data.remain_stat;
      state.pharData.created_at = data.created_at;

      commit("maskStateColorSet");
    },
    pharInfocoll: function({ state }) {
      console.log("Add collapse state event");
      $("#collapse-box").on("show.bs.collapse", () => {
        $("#aside-box").scrollTop('0');
      }).on("shown.bs.collapse", () => {
        state.collActive = true;
      }).on("hidden.bs.collapse", () => {
        state.collActive = false;
      })
    }
  }
})
