'use strict';

var express = require('express');
var router = express.Router();
var request = require('request');
var convert = require('xml-js');

/* GET home page. */
router.get("/", function(req, res, next) {
  console.log("Get index page")
  res.render("index", { title: "코맵" });
});

router.post("/getPharData", function(req, res, next) {
  console.log("Get pharmacy data");
  let parameter = null;
  if(req.body.radius < 2000) {
    parameter = `ServiceKey=fegpedtKtwYTmj7I3snh%2FHv87yY9yS1ozjNeUfCYS3Gz4awV%2FMsDdOspijQsS7qGrpXxzFt07ULvhyBHjsKXsA%3D%3D&Q0=${encodeURI(req.body.address.region_1depth_name)}&Q1=${encodeURI(req.body.address.region_2depth_name.split(' ')[0])}&numOfRows=10000`;
  } else {
    parameter = `ServiceKey=fegpedtKtwYTmj7I3snh%2FHv87yY9yS1ozjNeUfCYS3Gz4awV%2FMsDdOspijQsS7qGrpXxzFt07ULvhyBHjsKXsA%3D%3D&Q0=${encodeURI(req.body.address.region_1depth_name)}&numOfRows=10000`;
  }
  request({
    url: `http://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyListInfoInqire?${parameter}`,
    method: "get"
  }, function (error, response, result) {
    console.log("Get sales pharmacy data")
    // let jsonData = JSON.parse(convert.xml2json(result, {compact: true, spaces: 2}));
    // let openPharList = jsonData.response.body.items.item;

    // if(openPharList == undefined) openPharList = [];
    let openPharList = [];
    if(openPharList.length != 0) {
      for(var i = 0; i < openPharList.length; i++) {
        let dutyTimeObj = {};
        let openPharmacy = openPharList[i];
        if(openPharmacy.dutyTime1s != undefined) dutyTimeObj.dutyTimeStart1 = openPharmacy.dutyTime1s._text;
        if(openPharmacy.dutyTime1c != undefined) dutyTimeObj.dutyTimeEnd1 = openPharmacy.dutyTime1c._text;
        if(openPharmacy.dutyTime2s != undefined) dutyTimeObj.dutyTimeStart2 = openPharmacy.dutyTime2s._text;
        if(openPharmacy.dutyTime2c != undefined) dutyTimeObj.dutyTimeEnd2 = openPharmacy.dutyTime2c._text;
        if(openPharmacy.dutyTime3s != undefined) dutyTimeObj.dutyTimeStart3 = openPharmacy.dutyTime3s._text;
        if(openPharmacy.dutyTime3c != undefined) dutyTimeObj.dutyTimeEnd3 = openPharmacy.dutyTime3c._text;
        if(openPharmacy.dutyTime4s != undefined) dutyTimeObj.dutyTimeStart4 = openPharmacy.dutyTime4s._text;
        if(openPharmacy.dutyTime4c != undefined) dutyTimeObj.dutyTimeEnd4 = openPharmacy.dutyTime4c._text;
        if(openPharmacy.dutyTime5s != undefined) dutyTimeObj.dutyTimeStart5 = openPharmacy.dutyTime5s._text;
        if(openPharmacy.dutyTime5c != undefined) dutyTimeObj.dutyTimeEnd5 = openPharmacy.dutyTime5c._text;
        if(openPharmacy.dutyTime6s != undefined) dutyTimeObj.dutyTimeStart6 = openPharmacy.dutyTime6s._text;
        if(openPharmacy.dutyTime6c != undefined) dutyTimeObj.dutyTimeEnd6 = openPharmacy.dutyTime6c._text;
        if(openPharmacy.dutyTime7s != undefined) dutyTimeObj.dutyTimeStart7 = openPharmacy.dutyTime7s._text;
        if(openPharmacy.dutyTime7c != undefined) dutyTimeObj.dutyTimeEnd7 = openPharmacy.dutyTime7c._text;
        let date = new Date();
        let day = date.getDay();
        let dutyStartTime = null;
        let dutyEndTime = null;
        if(day == 0) day = 7;
        Object.entries(dutyTimeObj).forEach(([key, value]) => {
          if(key.indexOf(`Start${day}`) != -1) {
            dutyStartTime = value;
          }
          if(key.indexOf(`End${day}`) != -1) {
            dutyEndTime = value;
          }
        })
        openPharmacy.dutyTime = "정보없음";
        openPharmacy.dutyState = "정보없음";
        openPharmacy.dutyStateValue = "정보없음";
        if(dutyStartTime != null && dutyEndTime != null) {
          let dutyStartHour = parseInt(dutyStartTime.substr(0, 2));
          let dutyStartMinute = parseInt(dutyStartTime.substr(2, 4));
          let dutyEndHour = parseInt(dutyEndTime.substr(0, 2));
          let dutyEndMinute = parseInt(dutyEndTime.substr(2, 4));
          dutyStartTime = `${dutyStartHour}시 ${dutyStartMinute}분`;
          dutyEndTime = `${dutyEndHour}시 ${dutyEndMinute}분`;
          openPharmacy.dutyTime = `${dutyStartTime} ~ ${dutyEndTime}`;

          let currTime = new Date();
          let startTime = new Date();
          startTime.setHours(dutyStartHour);
          startTime.setMinutes(dutyStartMinute);
          let endTime = new Date();
          endTime.setHours(dutyEndHour);
          endTime.setMinutes(dutyEndMinute);
          if(startTime <= currTime && endTime >= currTime) {
            openPharmacy.dutyState = "영업중";
            openPharmacy.dutyStateValue = "영업중";
          } else {
            openPharmacy.dutyState = "영업종료";
            openPharmacy.dutyStateValue = "영업종료";
          }
        } else {
          let currTime = new Date();
          let startTime = new Date();
          startTime.setHours(parseInt("08"));
          startTime.setMinutes(parseInt("00"));
          let endTime = new Date();
          endTime.setHours(parseInt("21"));
          endTime.setMinutes(parseInt("00"));
          if(startTime <= currTime && endTime >= currTime) {
            openPharmacy.dutyState = "정보없음";
            openPharmacy.dutyStateValue= "영업중";
          } else {
            openPharmacy.dutyState = "영업종료 (예측)";
            openPharmacy.dutyStateValue= "영업종료";
          }
        }
      }
    }
    request({
      url: `https://8oi9s0nnth.apigw.ntruss.com/corona19-masks/v1/storesByGeo/json?lat=${req.body.posLat}&lng=${req.body.posLng}&m=${req.body.radius}`,
      method: "get"
    }, function (error, response, result) {
      console.log("Get range pharmacy data");
      let data = JSON.parse(result).stores;
      let filterData = [];
      let count = 0;
      for(var i = 0; i < data.length; i++) {
        if(data[i].remain_stat == "plenty") {
          data[i].remain_stat = "100+";
        } else if(data[i].remain_stat == "some") {
          data[i].remain_stat = "30 ~ 100";
        } else if(data[i].remain_stat == "few") {
          data[i].remain_stat = "2 ~ 30";
        } else if(data[i].remain_stat == "empty") {
          data[i].remain_stat = "0 ~ 1";
        } else if(data[i].remain_stat == "break") {
          data[i].remain_stat = "판매중지";
        } else {
          data[i].remain_stat = "정보없음";
        }
        if(data[i].stock_at == null || data[i].stock_at == undefined) {
          data[i].stock_at = "정보없음"
        }
        let currTime = new Date();
        let startTime = new Date();
        startTime.setHours(parseInt("08"));
        startTime.setMinutes(parseInt("00"));
        let endTime = new Date();
        endTime.setHours(parseInt("21"));
        endTime.setMinutes(parseInt("00"));
        let dutyState = null;
        let dutyStateValue = null;
        if(startTime <= currTime && endTime >= currTime) {
          dutyState = "정보없음";
          dutyStateValue= "영업중";
        } else {
          dutyState = "영업종료 (예측)";
          dutyStateValue= "영업종료";
        }
        filterData[count] = {
          "created_at": data[i].created_at,
          "lat": data[i].lat,
          "lng": data[i].lng,
          "name": data[i].name,
          "remain_stat": data[i].remain_stat,
          "stock_at": data[i].stock_at,
          "dutyTime": "정보없음",
          "dutyState": dutyState,
          "dutyStateValue": dutyStateValue,
          "address": data[i].addr,
          "phoneNumber": "정보없음"
        }
        for(var j = 0; j < openPharList.length; j++) {
          let openPharLat = null
          let openPharLng = null
          if(openPharList[j].wgs84Lat != undefined) openPharLat = parseFloat(openPharList[j].wgs84Lat._text).toFixed(4);
          if(openPharList[j].wgs84Lon != undefined) openPharLng = parseFloat(openPharList[j].wgs84Lon._text).toFixed(4);
          if(data[i].name == openPharList[j].dutyName._text &&
          parseFloat(data[i].lat).toFixed(4) == openPharLat &&
          parseFloat(data[i].lng).toFixed(4) == openPharLng) {
            let name = null;
            if(data[i].name == null || data[i].name == undefined) {
              name = openPharList[j].dutyName._text;
            } else {
              name = data[i].name;
            }
            if(openPharList[j].dutyName == null || openPharList[j].dutyName._text == undefined) {
              name = data[i].name;
            } else {
              name = openPharList[j].dutyName._text
            }
            let address = null;
            if(data[i].addr == null || data[i].addr == undefined) {
              address = openPharList[j].dutyAddr._text;
            } else {
              address = data[i].addr;
            }
            if(openPharList[j].dutyAddr._text == null || openPharList[j].dutyAddr._text == undefined) {
              address = data[i].addr;
            } else {
              address = openPharList[j].dutyAddr._text;
            }
            filterData[count] = {
              "created_at": data[i].created_at,
              "lat": data[i].lat,
              "lng": data[i].lng,
              "name": name,
              "remain_stat": data[i].remain_stat,
              "stock_at": data[i].stock_at,
              "dutyTime": openPharList[j].dutyTime,
              "dutyState": openPharList[j].dutyState,
              "dutyStateValue": openPharList[j].dutyStateValue,
              "address": address,
              "phoneNumber": openPharList[j].dutyTel1._text
              // "phoneNumber": "정보없음"
            }
          }
        }
        count++;
      }

      res.send(filterData);
    })
  })
});

module.exports = router;