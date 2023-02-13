import { _decorator } from 'cc'

import { EntityManager } from '../../Base/EntityManager'
import { IEntity } from '../../Level'
import { SmokeStateMachine } from './SmokeStateMachine'
const { ccclass } = _decorator

@ccclass('SmokeManager')
export class SmokeManager extends EntityManager {
    async init(params: IEntity) {
        this.fsm = this.addComponent(SmokeStateMachine)
        await this.fsm.init()
        //退出init方法后才执行状态变化
        super.init(params)
    }
}
