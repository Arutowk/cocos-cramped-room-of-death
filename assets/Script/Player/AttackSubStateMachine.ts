import DirectionSubStateMachine from '../../Base/DirectionSubStateMachine'
import StateMachine from '../../Base/StateMachine'
import { DIRECTION_ENUM } from '../../Enum'
import State from '../../Base/State'
import { AnimationClip } from 'cc'

const BASE_URL = 'texture/player/attack'

export default class AttackSubStateMachine extends DirectionSubStateMachine {
    constructor(fsm: StateMachine) {
        super(fsm)
        this.stateMachines.set(DIRECTION_ENUM.TOP, new State(fsm, `${BASE_URL}/top`, AnimationClip.WrapMode.Normal))
        this.stateMachines.set(
            DIRECTION_ENUM.BOTTOM,
            new State(fsm, `${BASE_URL}/bottom`, AnimationClip.WrapMode.Normal),
        )
        this.stateMachines.set(DIRECTION_ENUM.LEFT, new State(fsm, `${BASE_URL}/left`, AnimationClip.WrapMode.Normal))
        this.stateMachines.set(DIRECTION_ENUM.RIGHT, new State(fsm, `${BASE_URL}/right`, AnimationClip.WrapMode.Normal))
    }
}
