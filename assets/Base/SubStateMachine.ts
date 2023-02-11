import { _decorator, Component, Animation, SpriteFrame } from 'cc'
import { FSM_PARAM_TYPE_ENUM } from '../Enum'
import State from './State'
import { StateMachine } from './StateMachine'

export abstract class SubStateMachine {
    //参数列表和状态机列表，根据当前状态和参数列表决定下一个状态
    private _currentState: State = null
    stateMachines: Map<string, State> = new Map()

    constructor(public fsm: StateMachine) {}

    //在改变状态的时候希望State播放动画和一些自定义事件
    get currentState() {
        return this._currentState
    }
    set currentState(newState) {
        this._currentState = newState
        //播放动画
        this._currentState.run()
    }

    abstract run(): void
}
