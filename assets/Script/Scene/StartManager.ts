import { _decorator, Component, Node, Event, director } from 'cc'
import { SCENE_ENUM } from '../../Enum'
import FaderManager from '../../Runtime/FaderManager'
const { ccclass, property } = _decorator

@ccclass('StartManager')
export class StartManager extends Component {
    onLoad() {
        FaderManager.Instance.fadeOut(1000)
        this.node.once(Node.EventType.TOUCH_END, this.handleStart, this)
    }

    async handleStart() {
        await FaderManager.Instance.fadeIn(300)
        director.loadScene(SCENE_ENUM.Battle)
    }
}
