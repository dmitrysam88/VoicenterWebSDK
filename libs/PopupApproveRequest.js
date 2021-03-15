let popupApproveLogicFolder = __dirname + "/../../../";
if (global.config.popupApproveLogicFolder) popupApproveLogicFolder = __dirname + "/../../../" + global.config.popupLogicFolder;
console.log("Loading PopupRequest Class , popup Logic folder is :", popupApproveLogicFolder);
const clear = require("clear-module");
const CallCustomParam = require("../libs/ivrAction/callParam");
const jwt = require('jsonwebtoken');

const ssh = 'shhhhh';

module.exports = class PopupRequest {
    constructor(request, reply) {
        this.request = request;
        this.reply = reply;
        this.popupApproveLogic = null;
        this.done = false;
        // Main Request Popup  Vars
        this.phone = null;
        this.target = null;
        this.ivruniqueid = null;
        this.did = null;
        this.queueid = null;
        this.status = null;
        this.popupURL = null;
        // Set up Response Data
        this.Result = '';
    }
    async ParseRequest() {
        try {
            if (this.request.params.PopupApproveLogic && (this.request.query.reload || this.request.query.Reload)) {
                clear(popupLogicFolder + '/' + this.request.params.PopupApproveLogic)
            }
        } catch (e) {
            console.error("MODULE reload failed  " + this.request.params.PopupApproveLogic, e)
        }
        if (this.request.params.PopupApproveLogic) {
            try {
                this.popupApproveLogic = require(popupApproveLogicFolder + '/' + this.request.params.PopupApproveLogic);
            } catch (e) {
                if (e.code === 'MODULE_NOT_FOUND') {
                    // The module hasn't been found
                    console.error("MODULE_NOT_FOUND " + this.request.params.PopupLogic, e)
                }
                console.error("MODULE load failed  " + this.request.params.PopupLogic, e);
                console.error("Loading  " + __dirname + "../DefualtCallLogic");

                this.popupLogic = require("../DefualtPopupLogic")
            }
        } else {
            this.popupLogic = require("../DefualtPopupLogic")
        }
        try {
            if (this.request.body) {
                if (this.request.body.phone) this.phone = this.request.body.phone;
                if (this.request.body.ivrid) this.ivruniqueid = this.request.body.ivrid;
                if (this.request.body.extenUser) this.target = this.request.body.extenUser;
                if (this.request.body.did) this.did = this.request.body.did;
                if (this.request.body.statusCall) this.status = this.request.body.statusCall;
                if (this.request.body.popupURL) this.popupURL = this.request.body.popupURL;

                //Parsing CUSTOM_DATA
                if (this.request.body.CUSTOM_DATA && this.request.body.CUSTOM_DATA.constructor.name === "Object") {
                    Object.keys(this.request.body.DATA.CUSTOM_DATA).forEach(function (varName) {
                        try {
                            that.CustomDataParmList.push(new CallCustomParam(varName, that.request.body.DATA.CUSTOM_DATA[varName], false));
                        } catch (e) {
                            console.error("Failed adding CUSTOM_DATA parameter ", varName);
                        }
                    })
                }
            }
            else if (this.request.query) {
                let popapRequestData = jwt.verify(this.request.query.data, ssh);
                if (popapRequestData.phone) this.phone = popapRequestData.phone;
                if (popapRequestData.ivrid) this.ivruniqueid = popapRequestData.ivrid;
                if (popapRequestData.extenUser) this.target = popapRequestData.extenUser;
                if (popapRequestData.did) this.did = popapRequestData.did;
                if (popapRequestData.statusCall) this.status = popapRequestData.statusCall;
                if (popapRequestData.popupURL) this.popupURL = popapRequestData.popupURL;


                //Parsing CUSTOM_DATA
                if (this.request.query.CUSTOM_DATA && this.request.query.CUSTOM_DATA.constructor.name === "Object") {
                    Object.keys(this.request.query.DATA.CUSTOM_DATA).forEach(function (varName) {
                        try {
                            that.CustomDataParmList.push(new CallCustomParam(varName, that.request.query.DATA.CUSTOM_DATA[varName], false));
                        } catch (e) {
                            console.error("Failed adding CUSTOM_DATA parameter ", varName);
                        }
                    })
                }
            }
        } catch (e) {
            console.error("parseRequest failed ", e)
        }
    }
    Done() {
        this.done = true;
        this.reply.type('text/html');
        this.reply.send(this.Result);
    }
    async DoPopupApproveLogic() {
        await this.popupApproveLogic(this);
        if (!this.done) this.Done();

    }
    // Call Custom Param Functions  Start
    SetParam(parmName, paramValue) {
        let params = this.CustomDataParmList.filter(function (p) { return p.Name === parmName });
        if (params.length > 0) {
            params.forEach(function (param) {
                param.Update(paramValue)
            })
        } else {
            this.CustomDataParmList.push(new CallCustomParam(parmName, paramValue, true));
        }

    }
    // Call Custom Param Functions  End
};
