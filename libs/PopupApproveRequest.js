let popupLogicFolder = __dirname + "/../../../";
if (global.config.popupLogicFolder) popupLogicFolder = __dirname + "/../../../" + global.config.popupLogicFolder;
console.log("Loading PopupRequest Class , popup Logic folder is :", popupLogicFolder);
const clear = require("clear-module");
const CallCustomParam = require("../libs/ivrAction/callParam");
const Request = require("./Request");
const jwt = require("jsonwebtoken");

let keyConfig = {};
try {
    keyConfig = require(global.config.modulePath + '/' + 'keyConfig');
} catch(err) {
    console.log(err);
}

const jwtKey = keyConfig.jwtKey;

module.exports = class PopupApproveRequest extends Request {
    constructor(request, reply) {
        super(request, reply);
        this.popupURL = null;
        this.Result = '';
        this.clearActionModule();
        this.parseRequest();
    }

    async ParseJWTData() {
        let jwtData = jwt.verify(this.request.query.data, jwtKey);
        Object.assign(this, jwtData);
    }

    Done() {
        this.done = true;
        this.reply.type('text/html');
        this.reply.send(this.Result);
    }

    async DoPopupApproveLogic() {
        await this.modulePath(this);
        if (!this.done) this.Done();
    }
}
