"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getmac = __importStar(require("getmac"));
const socket_io_client_1 = __importDefault(require("socket.io-client"));
class Device {
    constructor(config) {
        this.sockets = [];
        this.actions = new Map();
        this.config = config;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.macAddress = yield this.getMac();
            this.sockets = yield Promise.all(this.config.servers.map(serverConfig => {
                return new Promise((resolve, reject) => {
                    const device = this.getStatusWithPayload({}).device;
                    const socket = socket_io_client_1.default.connect(`http://${serverConfig.host}:${serverConfig.port}`, {
                        query: Object.assign({}, device),
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
            }));
            this.initActions();
        });
    }
    destroy() {
        this.sockets.forEach(socket => {
            if (socket.connected) {
                socket.disconnect();
            }
        });
        this.sockets = [];
    }
    setStatusGetter(statusCallback) {
        this.statusCallback = statusCallback;
    }
    autoStatusOn(interval) {
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
        }
        this.statusInterval = setInterval(() => {
            if (this.statusCallback) {
                this.sendStatus(this.statusCallback());
            }
            else {
                throw new Error('Warning! Status getter not set!');
            }
        }, interval);
    }
    autoStatusOff() {
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = undefined;
        }
    }
    sendStatus(payload) {
        this.sockets.forEach(socket => {
            if (socket.connected) {
                socket.emit('status', this.getStatusWithPayload(payload));
            }
        });
    }
    onAction(action, fn) {
        this.actions.set(action, fn);
        this.sockets.forEach(socket => {
            socket.off(action);
            socket.on(action, fn);
        });
    }
    offAction(action) {
        this.actions.delete(action);
        this.sockets.forEach(socket => {
            socket.off(action);
        });
    }
    getMac() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                getmac.getMac((error, mac) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(mac);
                });
            });
        });
    }
    getDeviceInfo() {
        return {
            name: this.macAddress,
            type: this.config.type,
        };
    }
    getStatusWithPayload(payload) {
        const status = {
            device: this.getDeviceInfo(),
            payload,
        };
        return status;
    }
    initActions() {
        this.sockets.forEach(socket => {
            this.actions.forEach((fn, action) => {
                socket.on(action, fn);
            });
        });
    }
}
exports.Device = Device;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGV2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0RldmljZS9EZXZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrQ0FBaUM7QUFDakMsd0VBQWtDO0FBZ0JsQyxNQUFhLE1BQU07SUFRakIsWUFBWSxNQUFvQjtRQVB6QixZQUFPLEdBQTRCLEVBQUUsQ0FBQztRQUlyQyxZQUFPLEdBQStDLElBQUksR0FBRyxFQUFFLENBQUM7UUFJdEUsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVZLElBQUk7O1lBQ2YsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUNyQyxPQUFPLElBQUksT0FBTyxDQUF3QixDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFDNUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztvQkFDcEQsTUFBTSxNQUFNLEdBQUcsMEJBQUUsQ0FBQyxPQUFPLENBQ3ZCLFVBQVUsWUFBWSxDQUFDLElBQUksSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLEVBQ2xEO3dCQUNFLEtBQUssb0JBQ0EsTUFBTSxDQUNWO3FCQUNGLENBQ0YsQ0FBQztvQkFDRixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7d0JBQzFCLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDbEIsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxHQUFXLEVBQUUsRUFBRTt3QkFD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S0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFO29CQUMzQixJQUFJLEtBQUssRUFBRTt3QkFDVCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7cUJBQ2Y7b0JBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNmLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0tBQUE7SUFFTyxhQUFhO1FBQ25CLE9BQU87WUFDTCxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVU7WUFDckIsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSTtTQUN2QixDQUFDO0lBQ0osQ0FBQztJQUVPLG9CQUFvQixDQUFDLE9BQWU7UUFDMUMsTUFBTSxNQUFNLEdBQWlCO1lBQzNCLE1BQU0sRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQzVCLE9BQU87U0FDUixDQUFDO1FBQ0YsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVPLFdBQVc7UUFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ2xDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFsSUQsd0JBa0lDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZ2V0bWFjIGZyb20gJ2dldG1hYyc7XG5pbXBvcnQgaW8gZnJvbSAnc29ja2V0LmlvLWNsaWVudCc7XG5pbXBvcnQgeyBEZXZpY2VJbmZvLCBEZXZpY2VTdGF0dXMgfSBmcm9tICcuL1N0YXR1cyc7XG5leHBvcnQgeyBEZXZpY2VTdGF0dXMgfSBmcm9tICcuL1N0YXR1cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGV2aWNlU2VydmVyQ29uZmlnIHtcbiAgaG9zdDogc3RyaW5nO1xuICBwb3J0OiBudW1iZXI7XG59XG5cbnR5cGUgTWFjQWRkcmVzcyA9IHN0cmluZztcblxuZXhwb3J0IGludGVyZmFjZSBEZXZpY2VDb25maWcge1xuICB0eXBlOiBzdHJpbmc7XG4gIHNlcnZlcnM6IERldmljZVNlcnZlckNvbmZpZ1tdO1xufVxuXG5leHBvcnQgY2xhc3MgRGV2aWNlIHtcbiAgcHVibGljIHNvY2tldHM6IFNvY2tldElPQ2xpZW50LlNvY2tldFtdID0gW107XG4gIHByaXZhdGUgbWFjQWRkcmVzcyE6IHN0cmluZztcbiAgcHJpdmF0ZSBjb25maWc6IERldmljZUNvbmZpZztcbiAgcHJpdmF0ZSBzdGF0dXNJbnRlcnZhbD86IE5vZGVKUy5UaW1lb3V0O1xuICBwcml2YXRlIGFjdGlvbnM6IE1hcDxNYWNBZGRyZXNzLCAocGF5bG9hZDogb2JqZWN0KSA9PiB2b2lkPiA9IG5ldyBNYXAoKTtcbiAgcHJpdmF0ZSBzdGF0dXNDYWxsYmFjaz86ICgpID0+IG9iamVjdDtcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IERldmljZUNvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIGluaXQoKSB7XG4gICAgdGhpcy5tYWNBZGRyZXNzID0gYXdhaXQgdGhpcy5nZXRNYWMoKTtcbiAgICB0aGlzLnNvY2tldHMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgIHRoaXMuY29uZmlnLnNlcnZlcnMubWFwKHNlcnZlckNvbmZpZyA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxTb2NrZXRJT0NsaWVudC5Tb2NrZXQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBjb25zdCBkZXZpY2UgPSB0aGlzLmdldFN0YXR1c1dpdGhQYXlsb2FkKHt9KS5kZXZpY2U7XG4gICAgICAgICAgY29uc3Qgc29ja2V0ID0gaW8uY29ubmVjdChcbiAgICAgICAgICAgIGBodHRwOi8vJHtzZXJ2ZXJDb25maWcuaG9zdH06JHtzZXJ2ZXJDb25maWcucG9ydH1gLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBxdWVyeToge1xuICAgICAgICAgICAgICAgIC4uLmRldmljZSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICAgIHNvY2tldC5vbmNlKCdjb25uZWN0JywgKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZShzb2NrZXQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHNvY2tldC5vbmNlKCdjb25uZWN0X2Vycm9yJywgKGVycjogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGVycikpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHNvY2tldC5vbmNlKCdjb25uZWN0X3RpbWVvdXQnLCAoZXJyOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoZXJyKSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMuaW5pdEFjdGlvbnMoKTtcbiAgfVxuXG4gIHB1YmxpYyBkZXN0cm95KCkge1xuICAgIHRoaXMuc29ja2V0cy5mb3JFYWNoKHNvY2tldCA9PiB7XG4gICAgICBpZiAoc29ja2V0LmNvbm5lY3RlZCkge1xuICAgICAgICBzb2NrZXQuZGlzY29ubmVjdCgpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuc29ja2V0cyA9IFtdO1xuICB9XG5cbiAgcHVibGljIHNldFN0YXR1c0dldHRlcihzdGF0dXNDYWxsYmFjazogKCkgPT4gb2JqZWN0KSB7XG4gICAgdGhpcy5zdGF0dXNDYWxsYmFjayA9IHN0YXR1c0NhbGxiYWNrO1xuICB9XG5cbiAgcHVibGljIGF1dG9TdGF0dXNPbihpbnRlcnZhbDogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMuc3RhdHVzSW50ZXJ2YWwpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5zdGF0dXNJbnRlcnZhbCk7XG4gICAgfVxuICAgIHRoaXMuc3RhdHVzSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5zdGF0dXNDYWxsYmFjaykge1xuICAgICAgICB0aGlzLnNlbmRTdGF0dXModGhpcy5zdGF0dXNDYWxsYmFjaygpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignV2FybmluZyEgU3RhdHVzIGdldHRlciBub3Qgc2V0IScpO1xuICAgICAgfVxuICAgIH0sIGludGVydmFsKTtcbiAgfVxuXG4gIHB1YmxpYyBhdXRvU3RhdHVzT2ZmKCkge1xuICAgIGlmICh0aGlzLnN0YXR1c0ludGVydmFsKSB7XG4gICAgICBjbGVhckludGVydmFsKHRoaXMuc3RhdHVzSW50ZXJ2YWwpO1xuICAgICAgdGhpcy5zdGF0dXNJbnRlcnZhbCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc2VuZFN0YXR1cyhwYXlsb2FkOiBvYmplY3QpIHtcbiAgICB0aGlzLnNvY2tldHMuZm9yRWFjaChzb2NrZXQgPT4ge1xuICAgICAgaWYgKHNvY2tldC5jb25uZWN0ZWQpIHtcbiAgICAgICAgc29ja2V0LmVtaXQoJ3N0YXR1cycsIHRoaXMuZ2V0U3RhdHVzV2l0aFBheWxvYWQocGF5bG9hZCkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHVibGljIG9uQWN0aW9uKGFjdGlvbjogc3RyaW5nLCBmbjogKHBheWxvYWQ6IG9iamVjdCkgPT4gdm9pZCkge1xuICAgIHRoaXMuYWN0aW9ucy5zZXQoYWN0aW9uLCBmbik7XG4gICAgdGhpcy5zb2NrZXRzLmZvckVhY2goc29ja2V0ID0+IHtcbiAgICAgIHNvY2tldC5vZmYoYWN0aW9uKTtcbiAgICAgIHNvY2tldC5vbihhY3Rpb24sIGZuKTtcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBvZmZBY3Rpb24oYWN0aW9uOiBzdHJpbmcpIHtcbiAgICB0aGlzLmFjdGlvbnMuZGVsZXRlKGFjdGlvbik7XG4gICAgdGhpcy5zb2NrZXRzLmZvckVhY2goc29ja2V0ID0+IHtcbiAgICAgIHNvY2tldC5vZmYoYWN0aW9uKTtcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRNYWMoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPE1hY0FkZHJlc3M+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGdldG1hYy5nZXRNYWMoKGVycm9yLCBtYWMpID0+IHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICByZXNvbHZlKG1hYyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RGV2aWNlSW5mbygpOiBEZXZpY2VJbmZvIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogdGhpcy5tYWNBZGRyZXNzLFxuICAgICAgdHlwZTogdGhpcy5jb25maWcudHlwZSxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRTdGF0dXNXaXRoUGF5bG9hZChwYXlsb2FkOiBvYmplY3QpIHtcbiAgICBjb25zdCBzdGF0dXM6IERldmljZVN0YXR1cyA9IHtcbiAgICAgIGRldmljZTogdGhpcy5nZXREZXZpY2VJbmZvKCksXG4gICAgICBwYXlsb2FkLFxuICAgIH07XG4gICAgcmV0dXJuIHN0YXR1cztcbiAgfVxuXG4gIHByaXZhdGUgaW5pdEFjdGlvbnMoKSB7XG4gICAgdGhpcy5zb2NrZXRzLmZvckVhY2goc29ja2V0ID0+IHtcbiAgICAgIHRoaXMuYWN0aW9ucy5mb3JFYWNoKChmbiwgYWN0aW9uKSA9PiB7XG4gICAgICAgIHNvY2tldC5vbihhY3Rpb24sIGZuKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG4iXX0=