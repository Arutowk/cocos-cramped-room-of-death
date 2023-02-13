import { _decorator, Component, Graphics, view, Color, BlockInputEvents, UITransform, game } from 'cc'
const { ccclass, property } = _decorator

const SCREEN_WIDTH = view.getVisibleSize().width
const SCREEN_HEIGHT = view.getVisibleSize().height
export const DEFAULT_FADE_DURATION = 1000

enum FadeStatus {
    IDLE,
    FADE_IN,
    FADE_OUT,
}

@ccclass('DrawManager')
export class DrawManager extends Component {
    ctx: Graphics
    duration: number = DEFAULT_FADE_DURATION
    oldTime: number = 0
    fadeStatus: FadeStatus = FadeStatus.IDLE
    fadeResolve: (value: PromiseLike<null>) => void
    faderNode: Node
    block: BlockInputEvents

    init() {
        //阻止玩家操作
        this.block = this.addComponent(BlockInputEvents)
        this.ctx = this.addComponent(Graphics)
        const transform = this.getComponent(UITransform)
        transform.setAnchorPoint(0.5, 0.5)
        transform.setContentSize(SCREEN_WIDTH, SCREEN_HEIGHT)
        this.setAlpha(1)
    }

    //设置透明度，0为透明，1为全黑
    setAlpha(percent: number) {
        this.ctx.clear()
        //很诡异，要用2倍才能填充屏幕
        this.ctx.rect(0, 0, 2 * SCREEN_WIDTH, 2 * SCREEN_HEIGHT)
        this.ctx.fillColor = new Color(0, 0, 0, 255 * percent)
        this.ctx.fill()
        this.block.enabled = percent === 1
    }

    update() {
        //game.totalTime可以获取游戏已经进行的时间
        const fadePercent = (game.totalTime - this.oldTime) / this.duration
        // console.log(fadePercent)
        switch (this.fadeStatus) {
            case FadeStatus.FADE_IN:
                if (fadePercent < 1) {
                    this.setAlpha(fadePercent)
                } else {
                    this.fadeStatus = FadeStatus.IDLE
                    this.setAlpha(1)
                    this.fadeResolve(null)
                }
                break
            case FadeStatus.FADE_OUT:
                if (fadePercent < 1) {
                    this.setAlpha(1 - fadePercent)
                } else {
                    this.fadeStatus = FadeStatus.IDLE
                    this.setAlpha(0)
                    this.fadeResolve(null)
                }
                break
            default:
                break
        }
    }

    fadeIn(duration: number = DEFAULT_FADE_DURATION) {
        console.log('fade in')
        this.setAlpha(0)
        this.duration = duration
        this.fadeStatus = FadeStatus.FADE_IN
        this.oldTime = game.totalTime
        //时间不确定，返回Promise，更好的操作代码的同步异步问题
        return new Promise(resolve => {
            this.fadeResolve = resolve
        })
    }

    fadeOut(duration: number = DEFAULT_FADE_DURATION) {
        console.log('fade out')
        this.setAlpha(1)
        this.duration = duration
        this.fadeStatus = FadeStatus.FADE_OUT
        this.oldTime = game.totalTime
        return new Promise(resolve => {
            this.fadeResolve = resolve
        })
    }

    mask() {
        this.setAlpha(1)
        console.log(this.ctx)
        return new Promise(resolve => {
            setTimeout(resolve, DEFAULT_FADE_DURATION)
        })
    }
}
