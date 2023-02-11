import { _decorator } from 'cc'
import State from './State'
import StateMachine from './StateMachine'

/***
 * 子有限状态机基类
 * 用处：例如有个idle的state，但是有多个方向，为了让主状态机更整洁，可以把同类型的但具体不同的state都封装在子状态机中
 */
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
