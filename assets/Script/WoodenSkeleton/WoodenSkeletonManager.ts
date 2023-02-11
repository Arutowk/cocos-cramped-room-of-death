import { _decorator } from 'cc'

import { EntityManager } from '../../Base/EntityManager'
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../Enum'
import { WoodenSkeletonStateMachine } from './WoodenSkeletonStateMachine'

const { ccclass } = _decorator

@ccclass('WoodenSkeletonManager')
export class WoodenSkeletonManager extends EntityManager {
    async init() {
        this.fsm = this.addComponent(WoodenSkeletonStateMachine)
        await this.fsm.init()
        //退出init方法后才执行状态变化
        super.init({
            x: 7,
            y: 7,
            type: ENTITY_TYPE_ENUM.PLAYER,
            direction: DIRECTION_ENUM.TOP,
            state: ENTITY_STATE_ENUM.IDLE,
        })
        this.state = ENTITY_STATE_ENUM.IDLE
        this.direction = DIRECTION_ENUM.TOP
    }
}