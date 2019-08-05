"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = __importDefault(require("socket.io-client"));
class DeviceController {
    constructor(config) {
        this.config = config;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.socket = yield new Promise((resolve, reject) => {
                const serverConfig = this.config.manager;
                const socket = socket_io_client_1.default.connect(`http://${serverConfig.host}:${serverConfig.port}`, {
                    query: Object.assign({ controller: true }, this.config.target),
                });
                socket.once('connect', () => {
                    resolve(socket);
                });
                socket.once('connect_error', (err) => {
                    reject(new Error(err));
                });
                socket.once('connect_timeout', (err) => {
                    reject(new Error(err));
                });
            });
        });
    }
    getTargetConfig() {
        return this.config.target;
    }
    destroy() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
    onStatus(fn) {
        if (this.socket) {
            this.socket.on('status', fn);
        }
    }
    sendAction(action, payload) {
        if (this.socket) {
            this.socket.emit(action, payload);
        }
    }
}
exports.DeviceController = DeviceController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGV2aWNlQ29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9EZXZpY2UvRGV2aWNlQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsd0VBQWtDO0FBV2xDLE1BQWEsZ0JBQWdCO0lBSTNCLFlBQVksTUFBOEI7UUFDeEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVZLElBQUk7O1lBQ2YsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLElBQUksT0FBTyxDQUM3QixDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDbEIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7Z0JBQ3pDLE1BQU0sTUFBTSxHQUFHLDBCQUFFLENBQUMsT0FBTyxDQUN2QixVQUFVLFlBQVksQ0FBQyxJQUFJLElBQUksWUFBWSxDQUFDLElBQUksRUFBRSxFQUNsRDtvQkFDRSxLQUFLLGtCQUNILFVBQVUsRUFBRSxJQUFJLElBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQ3RCO2lCQUNGLENBQ0YsQ0FBQztnQkFDRixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7b0JBQzFCLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDbEIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxHQUFXLEVBQUUsRUFBRTtvQkFDM0MsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLENBQUMsQ0FBQyxDQUFDO2dCQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxHQUFXLEVBQUUsRUFBRTtvQkFDN0MsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUNGLENBQUM7UUFDSixDQUFDO0tBQUE7SUFFTSxlQUFlO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDNUIsQ0FBQztJQUVNLE9BQU87UUFDWixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1NBQzFCO0lBQ0gsQ0FBQztJQUVNLFFBQVEsQ0FBQyxFQUFrQztRQUNoRCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDOUI7SUFDSCxDQUFDO0lBRU0sVUFBVSxDQUFDLE1BQWMsRUFBRSxPQUFZO1FBQzVDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztTQUNuQztJQUNILENBQUM7Q0FDRjtBQXZERCw0Q0F1REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaW8gZnJvbSAnc29ja2V0LmlvLWNsaWVudCc7XG5pbXBvcnQgeyBEZXZpY2VTZXJ2ZXJDb25maWcgfSBmcm9tICcuL0RldmljZSc7XG5pbXBvcnQgeyBEZXZpY2VTdGF0dXMgfSBmcm9tICcuL1N0YXR1cyc7XG5leHBvcnQgeyBEZXZpY2VTdGF0dXMgfSBmcm9tICcuL1N0YXR1cyc7XG5pbXBvcnQgeyBUYXJnZXRDb25maWcgfSBmcm9tICcuLi9NYW5hZ2VyL01hbmFnZXInO1xuXG5leHBvcnQgaW50ZXJmYWNlIERldmljZUNvbnRyb2xsZXJDb25maWcge1xuICB0YXJnZXQ6IFRhcmdldENvbmZpZztcbiAgbWFuYWdlcjogRGV2aWNlU2VydmVyQ29uZmlnO1xufVxuXG5leHBvcnQgY2xhc3MgRGV2aWNlQ29udHJvbGxlciB7XG4gIHByaXZhdGUgc29ja2V0PzogU29ja2V0SU9DbGllbnQuU29ja2V0O1xuICBwcml2YXRlIGNvbmZpZzogRGV2aWNlQ29udHJvbGxlckNvbmZpZztcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IERldmljZUNvbnRyb2xsZXJDb25maWcpIHtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBpbml0KCkge1xuICAgIHRoaXMuc29ja2V0ID0gYXdhaXQgbmV3IFByb21pc2U8U29ja2V0SU9DbGllbnQuU29ja2V0PihcbiAgICAgIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3Qgc2VydmVyQ29uZmlnID0gdGhpcy5jb25maWcubWFuYWdlcjtcbiAgICAgICAgY29uc3Qgc29ja2V0ID0gaW8uY29ubmVjdChcbiAgICAgICAgICBgaHR0cDovLyR7c2VydmVyQ29uZmlnLmhvc3R9OiR7c2VydmVyQ29uZmlnLnBvcnR9YCxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBxdWVyeToge1xuICAgICAgICAgICAgICBjb250cm9sbGVyOiB0cnVlLFxuICAgICAgICAgICAgICAuLi50aGlzLmNvbmZpZy50YXJnZXQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgc29ja2V0Lm9uY2UoJ2Nvbm5lY3QnLCAoKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZShzb2NrZXQpO1xuICAgICAgICB9KTtcbiAgICAgICAgc29ja2V0Lm9uY2UoJ2Nvbm5lY3RfZXJyb3InLCAoZXJyOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKGVycikpO1xuICAgICAgICB9KTtcbiAgICAgICAgc29ja2V0Lm9uY2UoJ2Nvbm5lY3RfdGltZW91dCcsIChlcnI6IHN0cmluZykgPT4ge1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoZXJyKSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0VGFyZ2V0Q29uZmlnKCk6IFRhcmdldENvbmZpZyB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLnRhcmdldDtcbiAgfVxuXG4gIHB1YmxpYyBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLnNvY2tldCkge1xuICAgICAgdGhpcy5zb2NrZXQuZGlzY29ubmVjdCgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBvblN0YXR1cyhmbjogKHN0YXR1czogRGV2aWNlU3RhdHVzKSA9PiB2b2lkKSB7XG4gICAgaWYgKHRoaXMuc29ja2V0KSB7XG4gICAgICB0aGlzLnNvY2tldC5vbignc3RhdHVzJywgZm4pO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZW5kQWN0aW9uKGFjdGlvbjogc3RyaW5nLCBwYXlsb2FkOiBhbnkpIHtcbiAgICBpZiAodGhpcy5zb2NrZXQpIHtcbiAgICAgIHRoaXMuc29ja2V0LmVtaXQoYWN0aW9uLCBwYXlsb2FkKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==