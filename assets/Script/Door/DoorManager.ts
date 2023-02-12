import { _decorator } from 'cc'

import { EntityManager } from '../../Base/EntityManager'
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../Enum'
import { IEntity } from '../../Level'
import DataManager from '../../Runtime/Datamanager'
import EventManager from '../../Runtime/EventManager'
import { DoorStateMachine } from './DoorStateMachine'

const { ccclass } = _decorator

@ccclass('DoorManager')
export class DoorManager extends EntityManager {
    async init(params: IEntity) {
        this.fsm = this.addComponent(DoorStateMachine)
        await this.fsm.init()
        //退出init方法后才执行状态变化
        super.init(params)
        EventManager.Instance.on(EVENT_ENUM.DOOR_OPEN, this.onOpen, this)
    }

    onOpen() {
        if (
            DataManager.Instance.enemies.every(enemy => enemy.state === ENTITY_STATE_ENUM.DEATH) &&
            this.state !== ENTITY_STATE_ENUM.DEATH
        ) {
            this.state = ENTITY_STATE_ENUM.DEATH
        }
    }

    onDestroy() {
        super.onDestroy()
        EventManager.Instance.off(EVENT_ENUM.DOOR_OPEN, this.onOpen)
    }
}
