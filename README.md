# cocos-cramped-room-of-death
项目效果：https://arutowk.github.io/cocos-cramped-room-of-death/

按照b站up主Sli97的cocos creator教学视频学习制作的游戏项目，仿制steam游戏cramped room of death

# 项目总结

## 代码实现有限状态机来控制角色状态及动画切换

抽象基类StateMachine数据构成为一组参数列表和一组所有State状态枚举的列表。参数可以是Boolean，也可以是代表枚举的Number，作为开启状态切换的开关。Boolean类型一开始置为false。

具体类继承StateMachine时，需要自己实现init和run方法。init方法为初始化参数列表和初始化State状态列表的一系列操作。run方法负责当参数开关开启后，视情况改变当前的状态State。

每当参数改变的时候，需要调用给参数注册的setParams方法改变参数，同时其中会调用run方法完成状态的切换，状态currentState改变时，会调用目标State状态的run方法（与上条run不同）。

状态State类主要作用为实现动画的运行，其中的run方法会播放动画

衍生出SubState，主要作用让主状态更整洁、把同类型的但具体不同的state都封装在子状态机中，因为项目里人物不同方向的动画很多
