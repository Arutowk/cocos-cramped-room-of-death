import { _decorator, Component, Node, Event } from 'cc'
import { CONTROLLER_ENUM, EVENT_ENUM } from '../../Enum'
import EventManager from '../../Runtime/EventManager'
const { ccclass, property } = _decorator

@ccclass('ConControllerManager')
export class ConControllerManager extends Component {
    handleCtrl(event: Event, type: string) {
        EventManager.Instance.emit(EVENT_ENUM.PLAYER_CTRL, type as CONTROLLER_ENUM)
    }
}
