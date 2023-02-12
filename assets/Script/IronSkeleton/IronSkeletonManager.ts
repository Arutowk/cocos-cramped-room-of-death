import { _decorator } from 'cc'
import { EnemyManager } from '../../Base/EnemyManager'

import { EntityManager } from '../../Base/EntityManager'
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../Enum'
import { IEntity } from '../../Level'
import DataManager from '../../Runtime/Datamanager'
import EventManager from '../../Runtime/EventManager'
import { IronSkeletonStateMachine } from './IronSkeletonStateMachine'

const { ccclass } = _decorator

@ccclass('IronSkeletonManager')
export class IronSkeletonManager extends EnemyManager {
    async init(params: IEntity) {
        this.fsm = this.addComponent(IronSkeletonStateMachine)
        await this.fsm.init()
        //退出init方法后才执行状态变化
        super.init(params)
    }
}
