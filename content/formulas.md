---
chapter: 0
title: 公式速查手册
short: 公式速查
desc: 六章 + 两专题全部核心公式、成立条件、单位与常见取值，按主题分组并附易错提醒
minutes: 60
---

# 公式速查手册

手册按**主题**而不是按章节组织，因为同一个公式常常被多个章节反复使用（例如特性阻抗 $Z_0$ 同时出现在第 2、3、4 章）。每条公式都标注了**成立条件**与**单位**——这两项恰恰是考试扣分最集中的地方。

> **【EE5425 适用范围提示】**
> 本页公式按**原课程 6 章 + 2 专题**组织，其中第 3、4、7、8 章对应内容为 **EE5425 选学（不考）**。EE5425 新增的**放大器设计、稳定性与振荡器、射频测量**三章（<a href="ch09.html">第 9</a>／<a href="ch10.html">10</a>／<a href="ch11.html">11 章</a>）核心公式集中列在各章正文与小结框中，尚未并入本页的统一速查表，请直接前往对应章节查阅。

> **【记忆技巧】**
> 整本手册只需要记住 **五组"母公式"**，其余都能推出来：
> ① 波动关系 $\lambda f=v$；② 电报方程的两个一阶式；
> ③ 输入阻抗公式 $Z_{\mathrm{in}}=Z_0\dfrac{Z_l+jZ_0\tan\beta z}{Z_0+jZ_l\tan\beta z}$；
> ④ 反射系数与阻抗的互换 $\Gamma=\dfrac{Z-Z_0}{Z+Z_0}$、$Z=Z_0\dfrac{1+\Gamma}{1-\Gamma}$；
> ⑤ 截止条件 $k_c^2=k^2+\gamma^2$。
> 剩下的公式（驻波比、波腹位置、波导波长、相速群速、匹配枝节长度）都是这五组的推论。

---

## 一、基础波动关系

| 量 | 公式 | 条件与说明 |
|---|---|---|
| 波长—频率 | $\lambda f=v$ | 真空中 $v=c=2.998\times10^{8}\ \mathrm{m/s}$；工程取 $3\times10^{8}$ |
| 介质中光速 | $v=\dfrac{c}{\sqrt{\mu_r\varepsilon_r}}=\dfrac{1}{\sqrt{\mu\varepsilon}}$ | 非磁性介质 $\mu_r\approx1$，则 $v\approx c/\sqrt{\varepsilon_r}$ |
| 自由空间波数 | $k_0=\dfrac{2\pi}{\lambda_0}=\omega\sqrt{\mu_0\varepsilon_0}=\dfrac{\omega}{c}$ | 单位 $\mathrm{rad/m}$ |
| 介质中波数 | $k=\omega\sqrt{\mu\varepsilon}=k_0\sqrt{\mu_r\varepsilon_r}$ | 有耗介质中 $k$ 为复数 |
| 本征阻抗 | $\eta=\sqrt{\dfrac{\mu}{\varepsilon}}=\dfrac{\eta_0}{\sqrt{\mu_r\varepsilon_r}}$ | $\eta_0=120\pi\approx376.73\ \Omega$ |
| 角频率 | $\omega=2\pi f$ | 单位 $\mathrm{rad/s}$ |

$$\lambda=\frac{v}{f}\qquad\Longleftrightarrow\qquad f=\frac{v}{\lambda}
\tag{0-1-1}$$

**微波频段**：$f\in[300\ \mathrm{MHz},\,3000\ \mathrm{GHz}]$，对应 $\lambda\in[0.1\ \mathrm{mm},\,1\ \mathrm{m}]$（真空）。

---

## 二、传输线基本参数（第 2 章）

### 2.1 分布参数与电报方程

| 参数 | 含义 | 单位 | 物理来源 |
|---|---|---|---|
| $R$ | 单位长度电阻 | $\Omega/\mathrm{m}$ | 导体欧姆损耗（因趋肤效应随 $\sqrt f$ 增大） |
| $L$ | 单位长度电感 | $\mathrm{H/m}$ | 磁场储能 |
| $C$ | 单位长度电容 | $\mathrm{F/m}$ | 电场储能 |
| $G$ | 单位长度电导 | $\mathrm{S/m}$ | 介质损耗，$G=\omega C\tan\delta$ |

$$\frac{\partial u(z,t)}{\partial z}=-Ri(z,t)-L\frac{\partial i(z,t)}{\partial t}
\tag{2-2-1}$$

$$\frac{\partial i(z,t)}{\partial z}=-Gu(z,t)-C\frac{\partial u(z,t)}{\partial t}
\tag{2-2-2}$$

相量形式（把 $\partial/\partial t\to j\omega$，化微积分方程为复代数方程）：

$$\frac{dU(z)}{dz}=-ZI(z),\qquad \frac{dI(z)}{dz}=-YU(z),\qquad Z=R+j\omega L,\quad Y=G+j\omega C
\tag{2-2-3}$$

二阶形式与通解：

$$\frac{d^2U}{dz^2}-\gamma^2U=0,\qquad \frac{d^2I}{dz^2}-\gamma^2I=0
\tag{2-2-4}$$

$$U(z)=A_1e^{-\gamma z}+A_2e^{\gamma z}=U^+(z)+U^-(z)
\tag{2-2-5}$$

$$I(z)=\frac{1}{Z_0}\left(A_1e^{-\gamma z}-A_2e^{\gamma z}\right)=I^+(z)+I^-(z)
\tag{2-2-6}$$

> **【易错点】**
> 上面采用**主流教材约定**：$z$ 自**负载**起算、向**信源**为正，传播因子取 $e^{-\gamma z}$。因此 $U^+=A_1e^{-\gamma z}$ 沿 $-z$ 方向传播，是**入射波**（由信源流向负载）。若改用 $e^{+\gamma z}$ 约定（部分教材从信源起算），入射/反射的判别与反射系数指数中的符号都会翻转。**同一份卷子内必须统一**，否则所有相位结果都错一个符号。

终端条件（$z=0$ 处 $U=U_l$、$I=I_l$）对应的双曲函数解：

$$U(z)=U_l\cosh\gamma z+I_lZ_0\sinh\gamma z,\qquad I(z)=I_l\cosh\gamma z+\frac{U_l}{Z_0}\sinh\gamma z
\tag{2-2-7}$$

无耗时 $\gamma=j\beta$，退化为：

$$U(z)=U_l\cos\beta z+jI_lZ_0\sin\beta z,\qquad I(z)=I_l\cos\beta z+j\frac{U_l}{Z_0}\sin\beta z
\tag{2-2-8}$$

### 2.2 一次参数（固有参数）

**特性阻抗** $Z_0$ —— 定义为**入射波（或反射波）**的电压与电流之比，**不是合成波之比**：

$$Z_0=\frac{U^+}{I^+}=\frac{U^-}{-I^-}=\sqrt{\frac{Z}{Y}}=\sqrt{\frac{R+j\omega L}{G+j\omega C}}
\tag{2-3-1}$$

| 情形 | 结果 | 说明 |
|---|---|---|
| 无耗 $R=G=0$ | $Z_0=\sqrt{L/C}$ | **纯实数** |
| 小损耗 $R\ll\omega L,\ G\ll\omega C$ | $Z_0\approx\sqrt{\dfrac{L}{C}}\left[1+j\dfrac{1}{2}\left(\dfrac{G}{\omega C}-\dfrac{R}{\omega L}\right)\right]$ | 近似实数 |
| 双导线（径 $d$、距 $D$） | $Z_0=\dfrac{120}{\sqrt{\varepsilon_r}}\ln\dfrac{2D}{d}\ \Omega$ | 空气填充 |
| 同轴线（内 $a$ 外 $b$） | $Z_0=\dfrac{60}{\sqrt{\varepsilon_r}}\ln\dfrac{b}{a}\ \Omega$ | 常用 $50\ \Omega$、$75\ \Omega$ |

> **【易错点】**
> $Z_0$ 的单位是 $\Omega$，但它**不是电阻、也不表示损耗**。它是行波状态下 $U$ 与 $I$ 的固定比例关系，只由 $R,L,C,G$ 与 $\omega$ 决定，与位置 $z$、信源、负载都无关。

**传播常数**：

$$\gamma=\sqrt{ZY}=\sqrt{(R+j\omega L)(G+j\omega C)}=\alpha+j\beta
\tag{2-3-2}$$

| 情形 | $\alpha$ | $\beta$ |
|---|---|---|
| 无耗 | $\alpha=0$ | $\beta=\omega\sqrt{LC}$ |
| 小损耗 | $\alpha\approx\dfrac{R}{2Z_0}+\dfrac{GZ_0}{2}=\dfrac12\left(R\sqrt{\dfrac{C}{L}}+G\sqrt{\dfrac{L}{C}}\right)$ | $\beta\approx\omega\sqrt{LC}$ |

单位换算：$1\ \mathrm{Np}=8.686\ \mathrm{dB}$，即 $\alpha[\mathrm{dB/m}]=8.686\,\alpha[\mathrm{Np/m}]$。

**相速与波长**（由等相面 $\omega t\pm\beta z=\text{const}$ 求 $v_p=dz/dt$ 得到）：

$$v_p=\frac{\omega}{\beta},\qquad \lambda=\frac{2\pi}{\beta}=\frac{v_p}{f}
\tag{2-3-3}$$

无耗：$v_p=\dfrac{1}{\sqrt{LC}}$，$\lambda=\dfrac{c}{f\sqrt{\varepsilon_r}}$（介质）、$\lambda=\dfrac{c}{f}$（空气）。

> **【考点】**
> 有耗传输线的 $v_p$ 与 $\omega$ 有关 → **色散波**。无耗线 $v_p$ 与频率无关 → 无色散。这一条是判断题高频陷阱。

### 2.3 状态参量（工作参数）

**输入阻抗**：

$$Z_{\mathrm{in}}(z)=Z_0\frac{Z_l+jZ_0\tan\beta z}{Z_0+jZ_l\tan\beta z}\quad(\text{无耗})
\tag{2-3-4}$$

$$Z_{\mathrm{in}}(z)=Z_0\frac{Z_l+Z_0\tanh\gamma z}{Z_0+Z_l\tanh\gamma z}\quad(\text{有耗})
\tag{2-3-5}$$

两条极其重要的性质：

$$Z_{\mathrm{in}}(z+\lambda/2)=Z_{\mathrm{in}}(z)\quad\text{（二分之波长重复性）}
\tag{2-3-6}$$

$$Z_{\mathrm{in}}(z)\cdot Z_{\mathrm{in}}(z+\lambda/4)=Z_0^2\quad\text{（四分之波长阻抗变换性）}
\tag{2-3-7}$$

特别地 $Z_{\mathrm{in}}(\lambda/4)=\dfrac{Z_0^2}{Z_l}$。

**反射系数**：

$$\Gamma(z)=\frac{U^-(z)}{U^+(z)},\qquad \Gamma_i(z)=\frac{I^-(z)}{I^+(z)}=-\Gamma_u(z)
\tag{2-3-8}$$

$$\Gamma_l=\frac{Z_l-Z_0}{Z_l+Z_0}=|\Gamma_l|e^{j\varphi_l},\qquad 0\le|\Gamma_l|\le1\ (\text{无源负载})
\tag{2-3-9}$$

$$\Gamma(z)=\Gamma_l\,e^{-j2\beta z}=|\Gamma_l|\,e^{j(\varphi_l-2\beta z)}
\tag{2-3-10}$$

$$Z_{\mathrm{in}}(z)=Z_0\frac{1+\Gamma(z)}{1-\Gamma(z)},\qquad \Gamma(z)=\frac{Z_{\mathrm{in}}(z)-Z_0}{Z_{\mathrm{in}}(z)+Z_0}
\tag{2-3-11}$$

> **【记忆技巧】**
> 指数上为什么是 $-j2\beta z$？因为波"一来一回"，从观察点 $z$ 走到负载再反射回来共走了 $2z$，相位累计落后 $2\beta z$。据此自然得到：**$\Gamma$ 沿线幅度不变、相位每 $\lambda/2$ 变化 $2\pi$**，这就是"二分之波长重复性"的根源。工程上 $Z_{\mathrm{in}}$ 通常正是**先测 $\Gamma$ 再换算**得到的。

**驻波比**：

$$|U|_{\max}=|U^+|+|U^-|,\qquad |U|_{\min}=|U^+|-|U^-|
\tag{2-3-12}$$

$$\rho=\frac{|U|_{\max}}{|U|_{\min}}=\frac{1+|\Gamma_l|}{1-|\Gamma_l|},\qquad |\Gamma_l|=\frac{\rho-1}{\rho+1}
\tag{2-3-13}$$

| 状态 | 条件 | $|\Gamma_l|$ | $\rho$ | 物理特征 |
|---|---|---|---|---|
| 行波 | $Z_l=Z_0$ | $0$ | $1$ | 只有入射波，沿线 $|U|$ 不变，任意点 $Z_{\mathrm{in}}=Z_0$，功率单向满额传输 |
| 驻波 | $Z_l=0,\infty,\pm jX$ | $1$ | $\infty$ | 全反射，$U$ 与 $I$ 相位差 $\pi/2$，$P=0$，$Z_{\mathrm{in}}$ 纯电抗 |
| 行驻波 | $Z_l=R_l+jX_l,\ R_l>0$ | $0<|\Gamma_l|<1$ | $1<\rho<\infty$ | 既有传输又有振荡，存在波腹与波节 |

**行驻波的波腹/波节点位置**（核心考点）：

$$z_{\max}=\frac{\varphi_l\lambda}{4\pi}+\frac{n\lambda}{2}\quad(\text{电压波腹}),\qquad
z_{\min}=\frac{\varphi_l\lambda}{4\pi}+(2n+1)\frac{\lambda}{4}\quad(\text{电压波节})
\tag{2-3-14}$$

其中 $n$ 取使 $z$ 为**最小正值**的整数，得到第一波腹点与第一波节点。相邻波腹间距 $\lambda/2$，波腹与波节间距 $\lambda/4$。

波腹、波节处的输入阻抗均为**纯电阻**：

$$Z_{\mathrm{in}}(z_{\max})=Z_0\rho\equiv R_{\max},\qquad Z_{\mathrm{in}}(z_{\min})=\frac{Z_0}{\rho}\equiv R_{\min}
\tag{2-3-15}$$

$$R_{\max}\cdot R_{\min}=Z_0^2
\tag{2-3-16}$$

负载性质与第一波腹/波节点位置的对应关系：

| 负载 | 终端反射系数相位 $\varphi_l$ | 第一电压波腹 $z_{\max}$ | 第一电压波节 $z_{\min}$ |
|---|---|---|---|
| $Z_l=R_l<Z_0$（小电阻） | $\pi$ | $\lambda/4$ | $0$（负载处即波节） |
| $Z_l=R_l>Z_0$（大电阻） | $0$ | $0$（负载处即波腹） | $\lambda/4$ |
| $Z_l=R_l+jX_l$，$X_l>0$（感性） | $0<\varphi_l<\pi$ | $\dfrac{\varphi_l\lambda}{4\pi}\in(0,\tfrac{\lambda}{4})$ | $\dfrac{\varphi_l\lambda}{4\pi}+\dfrac{\lambda}{4}\in(\tfrac{\lambda}{4},\tfrac{\lambda}{2})$ |
| $Z_l=R_l+jX_l$，$X_l<0$（容性） | $-\pi<\varphi_l<0$ | $\dfrac{\varphi_l\lambda}{4\pi}+\dfrac{\lambda}{2}\in(\tfrac{\lambda}{4},\tfrac{\lambda}{2})$ | $\dfrac{\varphi_l\lambda}{4\pi}+\dfrac{\lambda}{4}\in(0,\tfrac{\lambda}{4})$ |
| $Z_l=Z_0$ | $0$ | 全场无波节 | 全场无波节 |

**终端反射系数的一般形式**（$Z_l=R_l+jX_l$）：

$$\Gamma_l=\frac{(R_l-Z_0)+jX_l}{(R_l+Z_0)+jX_l},\qquad
|\Gamma_l|=\sqrt{\frac{(R_l-Z_0)^2+X_l^2}{(R_l+Z_0)^2+X_l^2}},\qquad
\varphi_l=\arctan\frac{2X_lZ_0}{R_l^2+X_l^2-Z_0^2}
\tag{2-3-17}$$

$\varphi_l$ 的象限须由分子分母符号共同判定（$\varphi_l\in(-\pi,\pi]$）。

**反射系数的模沿线的表达式**（推导波腹位置时用）：

$$|U(z)|=|A_1|\sqrt{1+|\Gamma_l|^2+2|\Gamma_l|\cos(2\beta z-\varphi_l)}
\tag{2-3-18}$$

$$|I(z)|=\frac{|A_1|}{Z_0}\sqrt{1+|\Gamma_l|^2-2|\Gamma_l|\cos(2\beta z-\varphi_l)}
\tag{2-3-19}$$

### 2.4 三种工作状态的电压电流分布

| 状态 | $U(z)$（无耗） | $I(z)$（无耗） | $Z_{\mathrm{in}}(z)$ |
|---|---|---|---|
| 行波 $Z_l=Z_0$ | $A_1e^{-j\beta z}$ | $\dfrac{A_1}{Z_0}e^{-j\beta z}$ | $Z_0$（与 $z$ 无关） |
| 短路 $Z_l=0$ | $2jA_1\sin\beta z$ | $\dfrac{2A_1}{Z_0}\cos\beta z$ | $jZ_0\tan\beta z$ |
| 开路 $Z_l=\infty$ | $2A_1\cos\beta z$ | $j\dfrac{2A_1}{Z_0}\sin\beta z$ | $-jZ_0\cot\beta z$ |
| 纯电抗 $Z_l=jX_l$ | 同驻波 | 同驻波 | $jZ_0\tan\beta(z+\Delta z)$，$\Delta z=\dfrac{\lambda}{2\pi}\arctan\dfrac{X_l}{Z_0}$ |

> **【记忆技巧】**
> 短路与开路的全部结论**只差 $\lambda/4$**：把短路的 $z$ 平移 $\lambda/4$ 就得到开路（因为 $\tan(\beta z+\pi/2)=-\cot\beta z$）。所以只需记住短路的"电压波节在负载处、电流波腹在负载处、$Z_{\mathrm{in}}=jZ_0\tan\beta z$"，开路结果整体平移即可。
> 纯电抗负载的分析方法也由此而来：**以短路（或开路）为标准状态，沿传输线移动 $\Delta z$**。$X_l<0$（容性）→ $\Delta z<0$ → 向**负载**方向移动；$X_l>0$（感性）→ $\Delta z>0$ → 向**信源**方向移动。

### 2.5 传输功率、效率与损耗

设 $\gamma=\alpha+j\beta$（$\alpha>0$）、$Z_0$ 近似为实数：

$$P(z)=\frac12\mathrm{Re}\left[U(z)I^*(z)\right]=P_{\mathrm{in}}(z)-P_r(z)=\frac{|A_1|^2}{2Z_0}\left(e^{2\alpha z}-|\Gamma_l|^2e^{-2\alpha z}\right)
\tag{2-5-1}$$

$$P_{\mathrm{in}}(z)=\frac{|A_1|^2}{2Z_0}e^{2\alpha z},\qquad P_r(z)=|\Gamma_l|^2P_{\mathrm{in}}(z)
\tag{2-5-2}$$

负载吸收功率（$z=0$）：

$$P(0)=\frac{|A_1|^2}{2Z_0}\left(1-|\Gamma_l|^2\right)
\tag{2-5-3}$$

传输效率：

$$\eta=\frac{P(0)}{P(l)}=\frac{1-|\Gamma_l|^2}{e^{-2\alpha l}-|\Gamma_l|^2e^{2\alpha l}},\qquad
\eta_{\max}=e^{-2\alpha l}\ \big|\ \text{（匹配时最高，只取决于损耗）}
\tag{2-5-4}$$

| 指标 | 定义 | 说明 |
|---|---|---|
| 回波损耗 | $L_r=10\lg\dfrac{P_{\mathrm{in}}}{P_r}\ \mathrm{dB}$，或 $L_r=-20\lg|\Gamma|\ \mathrm{dB}$ | $|\Gamma|$ 越小，$L_r$ 越大，反射越小 |
| 插入损耗 | $L_i=10\lg\dfrac{P_{\mathrm{in}}}{P_t}\ \mathrm{dB}$ | $L_i$ 越大，传输损耗越大 |
| 功率电平 | $\mathrm{dBm}=10\lg\dfrac{P}{1\ \mathrm{mW}}$，$\mathrm{dBW}=10\lg\dfrac{P}{1\ \mathrm{W}}$ | $0\ \mathrm{dBm}=1\ \mathrm{mW}$，$30\ \mathrm{dBm}=1\ \mathrm{W}$ |

> **【易错点】**
> 回波损耗有**两种并行定义**：$L_r=10\lg(P_{\mathrm{in}}/P_r)$ 与 $L_r=-20\lg|\Gamma|$。两者数值相同（因为 $P_r/P_{\mathrm{in}}=|\Gamma|^2$），但**"定义"与"改善方向"必须说清**：$|\Gamma|\to0$ 时 $L_r\to+\infty$，所以工程上说"回波损耗越大越好"。若使用"反射系数 $|\Gamma|$ 越小越好"的表述则不会产生歧义，答题时建议直接给出 $|\Gamma|$ 或 $\rho$。

---

## 三、史密斯圆图（第 2 章）

### 3.1 归一化与映射

$$\bar z=\frac{Z_{\mathrm{in}}}{Z_0},\qquad \Gamma=\frac{\bar z-1}{\bar z+1},\qquad \bar z=\frac{1+\Gamma}{1-\Gamma}
\tag{2-6-1}$$

$$\bar y=\frac{Y}{Y_0}=\frac{Z_0}{Z_{\mathrm{in}}}=\frac{1}{\bar z}=\frac{1-\Gamma}{1+\Gamma}
\tag{2-6-2}$$

### 3.2 圆族方程

**等 $r$ 圆**（圆心在实轴上）：

$$\left(\Gamma_r-\frac{r}{1+r}\right)^2+\Gamma_i^2=\left(\frac{1}{1+r}\right)^2
\tag{2-6-3}$$

圆心 $\left(\dfrac{r}{1+r},0\right)$，半径 $\dfrac{1}{1+r}$。

**等 $x$ 圆**：

$$\left(\Gamma_r-1\right)^2+\left(\Gamma_i-\frac{1}{x}\right)^2=\left(\frac{1}{|x|}\right)^2
\tag{2-6-4}$$

圆心 $\left(1,\dfrac{1}{x}\right)$，半径 $\dfrac{1}{|x|}$。

由 $\bar z=\Gamma$ 的实虚部展开可直接得到：

$$r=\frac{1-\Gamma_r^2-\Gamma_i^2}{(1-\Gamma_r)^2+\Gamma_i^2},\qquad
x=\frac{2\Gamma_i}{(1-\Gamma_r)^2+\Gamma_i^2}
\tag{2-6-5}$$

### 3.3 圆图上的关键刻度

| 项目 | 数值 |
|---|---|
| 短路点 | $(-1,0)$，$\bar z=0$，$\Gamma=-1$ |
| 开路点 | $(+1,0)$，$\bar z=\infty$，$\Gamma=+1$ |
| 匹配点 | $(0,0)$，$\bar z=1$，$\Gamma=0$ |
| 实轴 | 上半平面 $x>0$ 感性；下半平面 $x<0$ 容性；实轴为纯电阻线 |
| 驻波比刻度 | 正实轴上 $\Gamma_r=\dfrac{\rho-1}{\rho+1}$，等 $\rho$ 圆即等 $|\Gamma|$ 圆 |
| 旋转关系 | 一周 $360^\circ$ 对应 $\lambda/2$；顺时针（$z$ 增大）向**信源** |
| 导纳圆图 | 阻抗圆图绕原点**旋转 $180^\circ$**（$\Gamma\to-\Gamma$） |

$$2\beta z=2\pi\quad\Longleftrightarrow\quad z=\frac{\lambda}{2},\qquad
\theta=-2\beta z=-\frac{4\pi z}{\lambda}
\tag{2-6-6}$$

> **【考点】**
> 圆图题的标准四步：①**归一化** $\bar z=Z/Z_0$（软件工具已预设 $Z_0$，不要重复归一化）；②定负载点；③沿等 $|\Gamma|$ 圆旋转，角度 $=\dfrac{z}{\lambda}\times720^\circ$，向信源顺时针；④读结果并乘回 $Z_0$。

---

## 四、阻抗匹配（第 2 章、第 6 章）

### 4.1 三种匹配状态

| 匹配类型 | 条件 | 效果 | 实现手段 |
|---|---|---|---|
| 负载阻抗匹配 | $Z_l=Z_0$，$\Gamma=0$ | 负载端无反射，$\eta$ 最高 | 阻抗匹配器 |
| 源阻抗匹配 | $Z_g=Z_0$ | 反射波回源无反射 | 匹配器、去耦衰减器、隔离器 |
| 共轭阻抗匹配 | $Z_{\mathrm{in}}=Z_g^*$ | 负载获得最大功率 | 匹配网络 |

$$P_{\max}=\frac{E_g^2}{8R_g}\quad(\text{最大输出功率定理})
\tag{2-7-1}$$

当 $Z_g,Z_0,Z_l$ 均为实数时，三种匹配等价。

### 4.2 四分之一波长变换器

$$Z_{\mathrm{in}}(\lambda/4)=\frac{Z_{01}^2}{Z_l}\ \Longrightarrow\ Z_{01}=\sqrt{Z_0R_l}
\tag{2-7-2}$$

复数负载 $Z_l=R_l+jX_l$ 的处理：先加一段 $Z_0$ 线把负载变换到波腹点 $R_{\max}=Z_0\rho$（或波节点 $R_{\min}=Z_0/\rho$，两者均为纯电阻），再用 $\lambda/4$ 变换器匹配：

$$Z_{01}=\sqrt{Z_0\cdot R_{\max}}=Z_0\sqrt{\rho}\quad\text{或}\quad Z_{01}=\frac{Z_0}{\sqrt{\rho}}
\tag{2-7-3}$$

> **【易错点】**
> $\lambda/4$ 变换器**只对单一频率成立**，因为 $\lambda=c/f$ 随频率变化 → **窄带**。要展宽带宽必须用多节阶梯阻抗变换器。这是简答题的标准答案要点。

### 4.3 单枝节调配器（串联短路枝节）

设 $\rho$ 为枝节接入前的驻波比，两组解为：

$$l_1=\frac{\lambda}{2\pi}\arctan\sqrt{\rho}\quad\text{或}\quad
l_1=\frac{\lambda}{2\pi}\left(\pi-\arctan\sqrt{\rho}\right)
\tag{2-7-4}$$

$$l_2=\frac{\lambda}{2\pi}\arctan\frac{1}{\sqrt{\rho}}\quad\text{或}\quad
l_2=\frac{\lambda}{2\pi}\arctan\frac{\rho-1}{\sqrt{\rho}}
\tag{2-7-5}$$

（$l_1$ 为枝节接入点距负载的距离，实现**电阻匹配**；$l_2$ 为短路枝节长度，实现**电抗匹配**。）

并联单枝节：把上述公式中的阻抗全部换成**导纳**，$l_1$ 使 $G_1=1/Z_0$，$l_2$ 使 $B_1+B_2=0$。

> **【记忆技巧】**
> 两组解的来源是史密斯圆图上**等 $|\Gamma|$ 圆与 $r=1$（或 $g=1$）圆的交点有两个**。所以答题时若只写一组解，应主动说明"另一组解对应圆图的另一交点"，这是体现理解深度的加分点。
> 另外 $l_2$ 存在 $\lambda/2$ 周期解：$l_2'=l_2+\lambda/2$ 同样满足匹配，因为短路枝节每 $\lambda/2$ 阻抗重复一次。

### 4.4 阶梯阻抗变换器

$N$ 节变换器的总反射系数（各节反射系数沿相位 $\theta=2\beta l$ 叠加）：

$$\Gamma(\theta)=\Gamma_0+\Gamma_1e^{-j2\theta}+\Gamma_2e^{-j4\theta}+\cdots+\Gamma_Ne^{-j2N\theta},
\qquad \theta=2\beta l=\frac{2\pi l}{\lambda}
\tag{2-7-6}$$

对称结构满足 $\Gamma_n=\Gamma_{N-n}$，于是

$$\Gamma(\theta)=2e^{-jN\theta}\left[\Gamma_0\cos N\theta+\Gamma_1\cos(N-2)\theta+\cdots\right]
\tag{2-7-7}$$

| 类型 | 反射系数分布 | 通带特性 |
|---|---|---|
| 二项式（最平坦） | $\Gamma_n=C_N^n\Gamma_0$ | 中心频率处各阶导数全为零，最平坦 |
| 切比雪夫（等波纹） | 由 $T_N(\cos\theta)$ 展开的系数 | 通带内等波纹，**给定带宽下节数最少** |

---

## 五、波导与规则金属波导（第 3 章）

### 5.1 一般理论

$$k_c^2=k^2+\gamma^2=\omega^2\mu\varepsilon+\gamma^2,\qquad
\gamma=\sqrt{k_c^2-k^2}=j\beta\ (k>k_c),\quad =\alpha\ (k<k_c)
\tag{3-2-1}$$

横向场由纵向分量决定（枢纽公式，$e^{-\gamma z}$ 约定）：

$$E_x=-\frac{1}{k_c^2}\left(\gamma\frac{\partial E_z}{\partial x}+j\omega\mu\frac{\partial H_z}{\partial y}\right),\qquad
E_y=-\frac{1}{k_c^2}\left(\gamma\frac{\partial E_z}{\partial y}-j\omega\mu\frac{\partial H_z}{\partial x}\right)
\tag{3-2-2}$$

$$H_x=\frac{1}{k_c^2}\left(j\omega\varepsilon\frac{\partial E_z}{\partial y}-\gamma\frac{\partial H_z}{\partial x}\right),\qquad
H_y=-\frac{1}{k_c^2}\left(j\omega\varepsilon\frac{\partial E_z}{\partial x}+\gamma\frac{\partial H_z}{\partial y}\right)
\tag{3-2-3}$$

| 波型 | 条件 | $k_c$ | 能否在空心单导体波导中存在 |
|---|---|---|---|
| TEM | $E_z=H_z=0$ | $0$ | **不能**（需双导体；单导体边界下只有平凡解） |
| TE（H 波） | $E_z=0$，$H_z\ne0$ | $>0$ | 能 |
| TM（E 波） | $H_z=0$，$E_z\ne0$ | $>0$ | 能 |

### 5.2 矩形波导（$a$ 沿 $x$、$b$ 沿 $y$，$a>b$）

$$k_c=\sqrt{\left(\frac{m\pi}{a}\right)^2+\left(\frac{n\pi}{b}\right)^2},\qquad
\lambda_c=\frac{2\pi}{k_c}=\frac{2}{\sqrt{(m/a)^2+(n/b)^2}},\qquad
f_c=\frac{c}{2\sqrt{\mu_r\varepsilon_r}}\sqrt{\left(\frac{m}{a}\right)^2+\left(\frac{n}{b}\right)^2}
\tag{3-3-1}$$

| 模式 | $\lambda_c$ | $a=2b$ 时 |
|---|---|---|
| TE$_{10}$（**主模**） | $2a$ | 最长，$f_c$ 最低 |
| TE$_{20}$ | $a$ | |
| TE$_{01}$ | $2b$ | |
| TE$_{11}$ / TM$_{11}$ | $\dfrac{2ab}{\sqrt{a^2+b^2}}$ | $=2b\sqrt{2}$ 当 $a=2b$，$\approx0.894a$ |

TM 模要求 $m\ge1$ 且 $n\ge1$；TE 模要求 $m,n$ 不同时为零。

**TE$_{10}$ 模的场（考试必背）**：

$$E_y=E_0\sin\frac{\pi x}{a}e^{-j\beta z},\qquad
H_x=-\frac{E_0}{Z_{\mathrm{TE}}} \sin\frac{\pi x}{a}e^{-j\beta z},\qquad
H_z=j\frac{E_0}{\omega\mu}\frac{\pi}{a}\cos\frac{\pi x}{a}e^{-j\beta z}
\tag{3-3-2}$$

$$E_x=E_z=H_y=0$$

（$H_x$ 前的负号来自 $\nabla\times\mathbf{E}=-j\omega\mu\mathbf{H}$ 与 $e^{-j\beta z}$ 约定：$H_x=-\dfrac{1}{j\omega\mu}\dfrac{\partial E_y}{\partial z}=-\dfrac{-\beta}{\omega\mu}E_y\cdot\dfrac{1}{1}$，整理即得。）

**传输特性**：

$$\lambda_g=\frac{2\pi}{\beta}=\frac{\lambda_0}{\sqrt{1-\left(\lambda_0/\lambda_c\right)^2}}=\frac{\lambda_0}{\sqrt{1-\left(f_c/f\right)^2}}
\tag{3-3-3}$$

$$\beta=k_0\sqrt{1-\left(f_c/f\right)^2}=\frac{2\pi}{\lambda_0}\sqrt{1-\left(f_c/f\right)^2}
\tag{3-3-4}$$

$$v_p=\frac{\omega}{\beta}=\frac{c}{\sqrt{1-\left(f_c/f\right)^2}}>c,\qquad
v_g=\frac{d\omega}{d\beta}=c\sqrt{1-\left(f_c/f\right)^2}<c
\tag{3-3-5}$$

$$v_pv_g=c^2\ \big|\ \text{（无耗、空气填充）}
\tag{3-3-6}$$

**波阻抗**：

$$Z_{\mathrm{TE}}=\frac{\omega\mu}{\beta}=\frac{\eta}{\sqrt{1-\left(f_c/f\right)^2}},\qquad
Z_{\mathrm{TM}}=\frac{\beta}{\omega\varepsilon}=\eta\sqrt{1-\left(f_c/f\right)^2}
\tag{3-3-7}$$

$$Z_{\mathrm{TEM}}=\eta=120\pi\approx376.7\ \Omega\ (\text{真空})
\tag{3-3-8}$$

**TE$_{10}$ 的衰减与功率**：

$$\alpha_c\big|_{\mathrm{TE}_{10}}=\frac{R_s}{b\eta\sqrt{1-\left(f_c/f\right)^2}}\left[1+\frac{2b}{a}\left(\frac{f_c}{f}\right)^2\right]\ \mathrm{Np/m},\qquad
R_s=\sqrt{\frac{\omega\mu}{2\sigma}}=\sqrt{\frac{\pi f\mu}{\sigma}}
\tag{3-3-9}$$

$$\alpha_d=\frac{k_0\tan\delta}{2\sqrt{1-\left(f_c/f\right)^2}}\ \mathrm{Np/m}
\tag{3-3-10}$$

$$P\big|_{\mathrm{TE}_{10}}=\frac{ab}{4Z_{\mathrm{TE}}}E_0^2=\frac{abE_0^2}{4\eta}\sqrt{1-\left(f_c/f\right)^2}
\tag{3-3-11}$$

> **【考点】**
> **TE$_{10}$ 的导体衰减随频率先降后升**，存在衰减最小的最佳频率（约 $f\approx\sqrt{3}f_c$ 附近，介于 $f_c$ 与 $2f_c$ 之间）。原因是分子中 $R_s\propto\sqrt f$ 增长，分母 $\sqrt{1-(f_c/f)^2}$ 在 $f\to f_c$ 时趋于 $0$：靠近截止时衰减发散，高频时表面电阻增长占主导。这是"为什么衰减曲线不是单调下降"这类思考题的标准答案。

**尺寸选择三原则**：

| 目标 | 条件 | 工程取值 |
|---|---|---|
| 单模（仅 TE$_{10}$）传输 | $\dfrac{\lambda}{2}<a<\lambda$，$b<\dfrac{\lambda}{2}$ 且 $b<\dfrac{a}{2}$ 满足 TE$_{01}$ 不出现 | $a\approx0.7\lambda$，$b=(0.4\sim0.5)a$，常取 $a=2b$ |
| 功率容量最大 | $a$、$b$ 尽量大 | $P\propto ab\sqrt{1-(f_c/f)^2}$ |
| 衰减最小、避免高次模 | $b$ 取尽可能大但不激发 TE$_{01}$ | 折中 |

> **【记忆技巧】**
> 单模工作区就是 $\lambda_c(\mathrm{TE}_{10})>\lambda>\lambda_c(\mathrm{TE}_{20})$，即 $2a>\lambda>a$，等价于 $f_c<f<2f_c$。因此**矩形波导的单模带宽上限就是下限的两倍**，这是它"宽带"的来源；而圆波导 TE$_{11}$ 主模与次高模的比值只有约 $1.31$，所以圆波导单模带宽窄。

### 5.3 圆波导（半径 $a$）

TM 模：$J_m(k_ca)=0$，$k_ca=\mu_{mn}$；TE 模：$J_m'(k_ca)=0$，$k_ca=\nu_{mn}$。

$$\lambda_{c,\mathrm{TM}_{mn}}=\frac{2\pi a}{\mu_{mn}},\qquad
\lambda_{c,\mathrm{TE}_{mn}}=\frac{2\pi a}{\nu_{mn}}
\tag{3-4-1}$$

| 模式 | 特征根 | $\lambda_c/a$ | $\lambda_c$（$2a=45.72\ \mathrm{mm}$ 时） | 说明 |
|---|---|---|---|---|
| TE$_{11}$（**主模**） | $\nu_{11}=1.841$ | $3.413$ | $78.0\ \mathrm{mm}$ | 截止波长最长；存在**极化简并**（两个正交极化） |
| TM$_{01}$ | $\mu_{01}=2.405$ | $2.613$ | $59.7\ \mathrm{mm}$ | 圆对称，轴向电场最强；雷达旋转关节、微波管 |
| TE$_{21}$ | $\nu_{21}=3.054$ | $2.057$ | $47.0\ \mathrm{mm}$ | 圆极化天线馈源 |
| TE$_{01}$ | $\nu_{01}=3.832$ | $1.640$ | $37.5\ \mathrm{mm}$ | 圆对称，壁电流只有 $\varphi$ 方向 → **衰减随频率升高反而下降** |
| TM$_{11}$ | $\mu_{11}=3.832$ | $1.640$ | $37.5\ \mathrm{mm}$ | 与 TE$_{01}$ **简并**（$\mu_{11}=\nu_{01}$） |

> **【易错点】**
> ① 圆波导主模是 **TE$_{11}$** 而**不是** TE$_{01}$——虽然 TE$_{01}$ 的衰减随频率下降（适合毫米波远距离传输 $\mathrm{H}_{01}$ 通信），但它的截止波长最短（不是主模），且极易转化为其他模式。
> ② $\lambda_c(\mathrm{TE}_{01})=\lambda_c(\mathrm{TM}_{11})$ 不是巧合，而是因为 $\nu_{01}=3.832=\mu_{11}$，两者**简并**。要区分"模式简并"（不同模式同 $\lambda_c$）与"极化简并"（同一模式的两个正交极化）。

### 5.4 激励与耦合

| 方式 | 元件 | 放置原则 | 典型结构 |
|---|---|---|---|
| 电激励 | 探针（电偶极子） | 平行于所需模式的**电场** | 波导宽边中央插入探针（该处 $E_y$ 最大） |
| 磁激励 | 耦合环（磁偶极子） | 环面垂直于所需模式的**磁场**（环轴平行 $H$） | 波导端壁/窄边开孔插入环 |
| 孔缝激励 | 小孔 / 缝隙 | 根据电耦合孔/磁耦合孔选择位置 | 定向耦合器、谐振腔耦合、测量线 |

---

## 六、微波传输线（第 4 章）

### 6.1 同轴线

$$E_r=\frac{E_0}{r}e^{-j\beta z},\qquad H_\varphi=\frac{E_0}{\eta r}e^{-j\beta z},\qquad
U=E_0\ln\frac{b}{a},\qquad I=\frac{2\pi E_0}{\eta}
\tag{4-2-1}$$

$$Z_0=\frac{U}{I}=\frac{\eta}{2\pi}\ln\frac{b}{a}=\frac{60}{\sqrt{\varepsilon_r}}\ln\frac{b}{a}\ \Omega
\tag{4-2-2}$$

| 优化目标 | 最佳 $b/a$ | 对应 $Z_0$（空气填充） | 推导要点 |
|---|---|---|---|
| 功率容量最大 | $e^{1/2}=1.65$ | $30\ \Omega$ | $P_{\max}=\dfrac{\pi a^2E_{\max}^2}{\eta}\ln\dfrac ba$，固定 $b$ 时令 $\dfrac{d}{da}\left[a^2\ln\dfrac ba\right]=0$，得 $\ln\dfrac ba=\dfrac12$ |
| 导体衰减最小 | $3.591$ | $76.7\ \Omega$ | 对 $\alpha_c\propto\dfrac{1/a+1/b}{\ln(b/a)}$ 求极值，得 $\ln\dfrac ba=1+\dfrac ab$，数值解 $b/a=3.591$ |
| **标准折中** | — | $\mathbf{50\ \Omega}$ | 兼顾功率容量与衰减，兼容标准连接器与波导 |

**高次模限制**（保证 TEM 单模传输）：

$$f_{c,\mathrm{TE}_{11}}\approx\frac{c}{\pi(a+b)\sqrt{\varepsilon_r}}\ \Longrightarrow\
\lambda_{c,\mathrm{TE}_{11}}\approx\pi(a+b)
\tag{4-2-3}$$

单模条件：$\lambda>\pi(a+b)$，即 $f<\dfrac{c}{\pi(a+b)\sqrt{\varepsilon_r}}$。

**衰减**：

$$\alpha_c=\frac{R_s}{2\eta\ln(b/a)}\left(\frac{1}{a}+\frac{1}{b}\right)\ \mathrm{Np/m},\qquad
\alpha_d=\frac{k_0\tan\delta}{2}\ \mathrm{Np/m}
\tag{4-2-4}$$

### 6.2 带状线（Stripline）

中心导带宽度 $w$、上下接地板间距 $b$、介质 $\varepsilon_r$，**准 TEM**、填充均匀介质：

$$v_p=\frac{c}{\sqrt{\varepsilon_r}},\qquad \lambda_g=\frac{c}{f\sqrt{\varepsilon_r}},\qquad f_c=0
\tag{4-3-1}$$

精确解（保角变换，$t\to0$）：

$$Z_0=\frac{30\pi}{\sqrt{\varepsilon_r}}\frac{K(k)}{K'(k)},\qquad k=\operatorname{sech}\frac{\pi w}{2b}
\tag{4-3-2}$$

| 区间 | $Z_0$ |
|---|---|
| $w/b<0.35$ | $Z_0=\dfrac{60}{\sqrt{\varepsilon_r}}\ln\dfrac{4b}{\pi d}$，$d=\dfrac{w}{2}\left[1+\dfrac{t}{w}\left(1+\ln\dfrac{4\pi w}{t}\right)\right]$ |
| $w/b>0.35$ | $Z_0=\dfrac{120\pi/\sqrt{\varepsilon_r}}{\dfrac{w}{b}+1.444+\dfrac{2}{\pi}\ln\left(1+\dfrac{2b}{t}\right)}$ |

尺寸限制：$b<\dfrac{\lambda_{\min}}{2\sqrt{\varepsilon_r}}$（抑制板间平行板模式与 TE 高次模）。

### 6.3 微带线（Microstrip）

导带宽度 $w$、基片厚度 $h$、相对介电常数 $\varepsilon_r$ —— **准 TEM**：

$$\varepsilon_e=\frac{C}{C_0},\qquad 1<\varepsilon_e<\varepsilon_r,\qquad
v_p=\frac{c}{\sqrt{\varepsilon_e}},\qquad \lambda_g=\frac{c}{f\sqrt{\varepsilon_e}},\qquad \beta=k_0\sqrt{\varepsilon_e}
\tag{4-4-1}$$

**有效介电常数（Hammerstad）**：

$$\varepsilon_e=\begin{cases}
\dfrac{\varepsilon_r+1}{2}+\dfrac{\varepsilon_r-1}{2}\left[\left(1+12\dfrac{h}{w}\right)^{-1/2}+0.04\left(1-\dfrac{w}{h}\right)^2\right], & w/h\le1\\[8pt]
\dfrac{\varepsilon_r+1}{2}+\dfrac{\varepsilon_r-1}{2}\left(1+12\dfrac{h}{w}\right)^{-1/2}, & w/h>1
\end{cases}
\tag{4-4-2}$$

**特性阻抗**：

$$Z_0=\begin{cases}
\dfrac{60}{\sqrt{\varepsilon_e}}\ln\left(\dfrac{8h}{w}+\dfrac{w}{4h}\right), & w/h\le1\\[10pt]
\dfrac{120\pi/\sqrt{\varepsilon_e}}{\dfrac{w}{h}+1.393+0.667\ln\left(\dfrac{w}{h}+1.444\right)}, & w/h>1
\end{cases}
\tag{4-4-3}$$

**尺寸选择（抑制高次模与表面波）**：

$$\lambda_{\min}>2h\sqrt{\varepsilon_r}\quad(\text{TM}_0\ \text{表面波}),\qquad
\lambda_{\min}>4h\sqrt{\varepsilon_r-1}\quad(\text{TE}_1\ \text{表面波})
\tag{4-4-4}$$

代入 $\lambda_{\min}=c/f_{\max}$，取两者中更严格者给出 $h$ 的上限。

**衰减**：

$$\alpha_d=27.3\frac{\varepsilon_r}{\sqrt{\varepsilon_e}}\frac{\varepsilon_e-1}{\varepsilon_r-1}\frac{\tan\delta}{\lambda_0}\ \mathrm{dB/m}
\tag{4-4-5}$$

> **【易错点】**
> ① 微带线**不是纯 TEM**：场一部分在空气中、一部分在基片中，只在低频才近似为准 TEM。高频（约 $h/\lambda_0>0.1$）时 $\varepsilon_e$ 与 $Z_0$ 随频率变化，**必须考虑色散**。
> ② 带状线填充**均匀介质**，所以 $v_p=c/\sqrt{\varepsilon_r}$；微带线必须用 $\varepsilon_e$ 而不是 $\varepsilon_r$——这是把两者公式混用的最常见错误。
> ③ 微带线 $Z_0$ **随 $w/h$ 增大而减小**（导带越宽、电容越大、阻抗越低），设计时不要记反。

### 6.4 耦合微带线与奇偶模

| 激励 | 对称面 | 端口关系 | 电容 | 特性阻抗 |
|---|---|---|---|---|
| 偶模（even） | **磁壁（PMC）** | $U_1=U_2=U_e$，$I_1=I_2=I_e$ | $C_e=C_{11}+C_{12}$ | $Z_{0e}=\dfrac{1}{v_e\sqrt{C_e C_0}}$ 形式 |
| 奇模（odd） | **电壁（PEC，等效接地）** | $U_1=-U_2=U_o$，$I_1=-I_2=I_o$ | $C_o=C_{11}-C_{12}$ | $Z_{0o}$ |

$$Z_{0e}\propto\frac{1}{\sqrt{C_e}},\qquad Z_{0o}\propto\frac{1}{\sqrt{C_o}},\qquad
C_e>C_o\ \Longrightarrow\ Z_{0e}<Z_{0o}
$$

**物理图像与结论**：偶模时两条导带电位相同，耦合电容 $C_{12}$ 两端无电位差、不通过位移电流 → 等效电容**减小** → 阻抗**增大**；奇模时两导带反相，耦合电容被"加倍利用" → 等效电容**增大** → 阻抗**减小**。

$$\boxed{Z_{0e}>Z_{0o}}
$$

> **【易错点】**
> 这是最容易记反的一条。请务必用上面的物理图像（"偶模电容小→阻抗大"）而不是死记住符号。检验方法：耦合很弱时 $C_{12}\to0$，应有 $Z_{0e}\approx Z_{0o}\approx Z_0$（单根线的特性阻抗），两者趋于相等；耦合越强两者差得越开。

**耦合系数与有效介电常数**：

$$k=\frac{Z_{0e}-Z_{0o}}{Z_{0e}+Z_{0o}},\qquad
\varepsilon_{ee},\ \varepsilon_{eo}\ \text{（奇偶模相速一般不同 → 色散与串扰）}
\tag{4-5-1}$$

### 6.5 介质波导与光纤

无金属壁，靠**折射率差 + 全反射**约束波；模式为混合模 HE / EH。

**归一化频率（V 数）与单模条件**：

$$V=\frac{2\pi a}{\lambda}\sqrt{n_1^2-n_2^2}=\frac{2\pi a}{\lambda}\mathrm{NA},\qquad
\mathrm{NA}=\sqrt{n_1^2-n_2^2}=n_1\sqrt{2\Delta},\quad
\Delta=\frac{n_1-n_2}{n_1}
\tag{4-6-1}$$

$$V<2.405\ \Longrightarrow\ \text{单模传输（HE}_{11}\text{ 主模）}
\tag{4-6-2}$$

| 光纤类型 | 折射率剖面 | 特点 |
|---|---|---|
| 阶跃（SI）多模 | 芯/包层阶跃 | 模式色散大，带宽受限 |
| 渐变（GI）多模 | 近抛物线分布 | 模式色散被自聚焦效应补偿，带宽提高 |
| 单模（SMF） | 阶跃、芯径极小 | $V<2.405$，无色散模，超长距离传输 |

| 低损耗窗口 | 波长 | 衰减量级 | 用途 |
|---|---|---|---|
| 第一窗口 | $0.85\ \mu\mathrm{m}$ | $\sim2\ \mathrm{dB/km}$ | 早期短距离 |
| 第二窗口 | $1.31\ \mu\mathrm{m}$ | $\sim0.35\ \mathrm{dB/km}$ | 零色散波长 |
| 第三窗口 | $1.55\ \mu\mathrm{m}$ | $\sim0.2\ \mathrm{dB/km}$ | 最小衰减，长距离干线 |

---

## 七、微波网络（第 5 章）

### 7.1 归一化

$$\bar U=\frac{U}{\sqrt{Z_0}},\qquad \bar I=I\sqrt{Z_0},\qquad
\bar z=\frac{Z}{Z_0}=\frac{\bar U}{\bar I}=\frac{1+\Gamma}{1-\Gamma},\qquad
P=\frac12\mathrm{Re}\left[UI^*\right]=\frac12\mathrm{Re}\left[\bar U\bar I^*\right]
\tag{5-2-1}$$

### 7.2 四种矩阵的定义

$$[Z]:\quad \begin{bmatrix}U_1\\U_2\end{bmatrix}=\begin{bmatrix}Z_{11}&Z_{12}\\Z_{21}&Z_{22}\end{bmatrix}\begin{bmatrix}I_1\\I_2\end{bmatrix},\qquad
[Y]:\quad \begin{bmatrix}I_1\\I_2\end{bmatrix}=\begin{bmatrix}Y_{11}&Y_{12}\\Y_{21}&Y_{22}\end{bmatrix}\begin{bmatrix}U_1\\U_2\end{bmatrix}
\tag{5-3-1}$$

$$[A]:\quad \begin{bmatrix}U_1\\I_1\end{bmatrix}=\begin{bmatrix}A&B\\C&D\end{bmatrix}\begin{bmatrix}U_2\\-I_2\end{bmatrix}
\tag{5-3-2}$$

$$[S]:\quad \begin{bmatrix}b_1\\b_2\end{bmatrix}=\begin{bmatrix}S_{11}&S_{12}\\S_{21}&S_{22}\end{bmatrix}\begin{bmatrix}a_1\\a_2\end{bmatrix},\qquad
a_i=\frac{U_i^+}{\sqrt{Z_{0i}}},\quad b_i=\frac{U_i^-}{\sqrt{Z_{0i}}}
\tag{5-3-3}$$

| 矩阵 | 元素的测量条件 | 单位 |
|---|---|---|
| $Z_{ij}$ | 相应端口**开路**（$I_k=0$） | $\Omega$ |
| $Y_{ij}$ | 相应端口**短路**（$U_k=0$） | $\mathrm{S}$ |
| $A,B,C,D$ | 端口 2 开路（$A,C$）或短路（$B,D$） | 无量纲 / $\Omega$ / $\mathrm{S}$ |
| $S_{ij}$ | 除端口 $j$ 外**全部接匹配负载**（$a_k=0$） | 无量纲 |

$$S_{ii}=\Gamma_i\ \big|\ \text{（其余端口匹配时的端口 }i\text{ 反射系数）},\qquad
S_{ij}=\text{端口 }j\to i\ \text{的传输系数}
\tag{5-3-4}$$

### 7.3 常用基本单元的 $[A]$ 矩阵（级联利器）

| 单元 | $[A]$ |
|---|---|
| 串联阻抗 $Z$ | $\begin{bmatrix}1&Z\\0&1\end{bmatrix}$ |
| 并联导纳 $Y$ | $\begin{bmatrix}1&0\\Y&1\end{bmatrix}$ |
| 传输线段（$\gamma l$） | $\begin{bmatrix}\cosh\gamma l&Z_0\sinh\gamma l\\ \dfrac{1}{Z_0}\sinh\gamma l&\cosh\gamma l\end{bmatrix}$ |
| 无耗线段（$\beta l$） | $\begin{bmatrix}\cos\beta l&jZ_0\sin\beta l\\ j\dfrac{1}{Z_0}\sin\beta l&\cos\beta l\end{bmatrix}$ |
| 理想变压器（变比 $n$） | $\begin{bmatrix}n&0\\0&1/n\end{bmatrix}$ |

**级联**：

$$[A]=[A_1][A_2]\cdots[A_n]
\tag{5-3-5}$$

传输矩阵（$[T]$，用于 $[S]$ 的级联）：

$$\begin{bmatrix}b_1\\a_1\end{bmatrix}=[T]\begin{bmatrix}a_2\\b_2\end{bmatrix},\qquad
[T]=\frac{1}{S_{21}}\begin{bmatrix}-(S_{11}S_{22}-S_{12}S_{21})&S_{11}\\-S_{22}&1\end{bmatrix},\qquad
[T]=[T_1][T_2]\cdots[T_n]
\tag{5-3-6}$$

### 7.4 矩阵之间的转换

$$[Z]=Z_0\left([I]+[S]\right)\left([I]-[S]\right)^{-1},\qquad
[S]=\left([Z]+Z_0[I]\right)^{-1}\left([Z]-Z_0[I]\right)
\tag{5-4-1}$$

$$[Z]=[Y]^{-1},\qquad
A=\frac{Z_{11}}{Z_{21}},\quad B=\frac{Z_{11}Z_{22}-Z_{12}Z_{21}}{Z_{21}},\quad C=\frac{1}{Z_{21}},\quad D=\frac{Z_{22}}{Z_{21}}
\tag{5-4-2}$$

$$S_{11}=\frac{A+B/Z_0-CZ_0-D}{A+B/Z_0+CZ_0+D},\qquad
S_{21}=\frac{2}{A+B/Z_0+CZ_0+D}
\tag{5-4-3}$$

$$S_{12}=\frac{2(AD-BC)}{A+B/Z_0+CZ_0+D},\qquad
S_{22}=\frac{-A+B/Z_0-CZ_0+D}{A+B/Z_0+CZ_0+D}
\tag{5-4-4}$$

**双端口 $[S]$ 与 $[z]$（归一化）的显式关系**（专题 8 的起点）：

$$[S]=\left([z]+[E]\right)^{-1}\left([z]-[E]\right),\qquad \Delta=(z_{11}+1)(z_{22}+1)-z_{12}z_{21}
\tag{5-4-5}$$

$$S_{11}=\frac{(z_{11}-1)(z_{22}+1)-z_{12}z_{21}}{\Delta},\qquad
S_{12}=\frac{2z_{12}}{\Delta},\qquad
S_{21}=\frac{2z_{21}}{\Delta},\qquad
S_{22}=\frac{(z_{11}+1)(z_{22}-1)-z_{12}z_{21}}{\Delta}
\tag{5-4-6}$$

### 7.5 网络性质一览（**核心考点**）

| 性质 | 数学条件 | 物理来源 |
|---|---|---|
| **互易** | $S_{ij}=S_{ji}$，即 $[S]=[S]^T$（转置对称） | 各向同性媒质（无铁氧体、无有源器件） |
| **无耗** | $[S]^+[S]=[I]$（**幺正矩阵**） | 不吸收功率，$\sum|a_i|^2=\sum|b_i|^2$ |
| **对称**（结构） | $S_{11}=S_{22}$（对角元相等） | 网络几何/电路结构对端口对称 |
| **无源** | $|S_{ij}|\le1$ 且 $[S]^+[S]\preceq[I]$ | 不产生功率 |
| **有耗判据** | $[S]^+[S]\ne[I]$，且行列式模 $<1$ | 存在耗散（如衰减器） |

**幺正性的两个直接推论**（反解 $[S]$ 的利器）：

$$\sum_k|S_{ki}|^2=1\ (\text{列模平方和为 }1),\qquad
\sum_kS_{ki}^*S_{kj}=0\ (i\ne j,\ \text{任意两列正交})
\tag{5-5-1}$$

> **【易错点】**
> **"互易"与"对称"是两个独立性质**，不能混为一谈。
> - 互易是 $S_{12}=S_{21}$（**非对角元**相等，来源是媒质）；
> - 对称是 $S_{11}=S_{22}$（**对角元**相等，来源是结构）。
> 理想传输线段同时互易、对称、无耗；铁氧体环行器无耗、结构可对称，但**非互易**；两端口接不同阻抗的网络互易但**不对称**。

**参考面移动对 $[S]$ 的影响**（端口 $i$ 向外移动 $l_i$，$\theta_i=\beta_il_i$）：

$$S'_{ii}=S_{ii}e^{-j2\theta_i},\qquad
S'_{ij}=S_{ij}e^{-j(\theta_i+\theta_j)}
\tag{5-5-2}$$

---

## 八、专题推导（第 7、8 章）

### 8.1 无耗网络 $[Z]$ 的反厄米性

$$\boxed{[Z]^+=-[Z]}\quad(\text{无耗，反厄米矩阵})
\tag{7-6-1}$$

分项结论：

$$\mathrm{Re}[Z_{nn}]=0\quad(\text{自阻抗纯虚}),\qquad
Z_{mn}=-Z_{nm}^*\ (m\ne n)
\tag{7-6-2}$$

即

$$\mathrm{Re}[Z_{mn}]=-\mathrm{Re}[Z_{nm}],\qquad
\mathrm{Im}[Z_{mn}]=\mathrm{Im}[Z_{nm}]
\tag{7-6-3}$$

**若还互易**（$Z_{mn}=Z_{nm}$）：$\mathrm{Re}[Z_{mn}]=0$，$[Z]$ 为**纯虚对称矩阵**，仍满足 $[Z]^+=-[Z]$。对 $[Y]$ 同理：$[Y]^+=-[Y]$。

四种矩阵的性质对照：

| 矩阵 | 无耗条件 | 互易条件 | 无耗 + 互易 | 对称 |
|---|---|---|---|---|
| $[Z]$ | $[Z]^+=-[Z]$（反厄米） | $[Z]=[Z]^T$ | 纯虚对称 | $Z_{11}=Z_{22}$ |
| $[Y]$ | $[Y]^+=-[Y]$ | $[Y]=[Y]^T$ | 纯虚对称 | $Y_{11}=Y_{22}$ |
| $[A]$ | $A,D$ 实；$B,C$ 纯虚；$AD-BC=1$ | $AD-BC=1$ | — | $A=D$ |
| $[S]$ | $[S]^+[S]=[I]$（幺正） | $[S]=[S]^T$ | 幺正 + 对称 | $S_{11}=S_{22}$ |

> **【核心概念】**
> $[S]$ 的**幺正性**与 $[Z]$ 的**反厄米性**是同一个物理事实（网络无耗）在不同参数下的表现，二者可以互相验证。判别网络是否无耗，用哪个矩阵都可以；判别互易性同理。

### 8.2 结构对称 ⇒ $S_{11}=S_{22}$

由 $[S]=\left([z]+[E]\right)^{-1}\left([z]-[E]\right)$ 展开 $2\times2$ 得式 (5-4-6)。代入对称条件 $z_{11}=z_{22}\equiv z_s$：

$$S_{11}=\frac{(z_s-1)(z_s+1)-z_{12}z_{21}}{(z_s+1)^2-z_{12}z_{21}},\qquad
S_{22}=\frac{(z_s+1)(z_s-1)-z_{12}z_{21}}{(z_s+1)^2-z_{12}z_{21}}
\tag{8-4-1}$$

两个分式的分子、分母**完全相同**（因为 $(z_s-1)(z_s+1)=(z_s+1)(z_s-1)=z_s^2-1$），故

$$\boxed{z_{11}=z_{22}\ \Longrightarrow\ S_{11}=S_{22}}
\tag{8-4-2}$$

逆命题**不成立**：$S_{11}=S_{22}$ 只是必要不充分条件（可能由参数巧合造成）。

> **【记忆技巧】**
> 三步记住这张对照表：**互易看非对角（$S_{12}=S_{21}$），对称看对角（$S_{11}=S_{22}$），无耗看整体（$[S]^+[S]=[I]$）**。三者相互独立，可以任意组合出现。

---

## 九、微波器件 $[S]$ 矩阵速查（第 6 章）

$$\text{E-T 接头}:\quad [S]=\frac12\begin{bmatrix}1&1&-\sqrt2\\1&1&\sqrt2\\-\sqrt2&\sqrt2&0\end{bmatrix}\quad\text{或等价形式（端口 1、2 等幅反相）}
\tag{6-6-1}$$

$$\text{H-T 接头}:\quad [S]=\frac12\begin{bmatrix}1&-1&\sqrt2\\-1&1&\sqrt2\\\sqrt2&\sqrt2&0\end{bmatrix}\quad\text{或等价形式（端口 1、2 等幅同相）}
\tag{6-6-2}$$

$$\text{魔 T（四端口全匹配）}:\quad [S]=\frac{1}{\sqrt2}\begin{bmatrix}0&0&1&1\\0&0&1&-1\\1&1&0&0\\1&-1&0&0\end{bmatrix}
\tag{6-6-3}$$

（端口 1、2 为主波导两端；端口 3 为 H 臂；端口 4 为 E 臂。取不同参考面会使元素符号或相位因子 $j$ 改变，但物理性质不变。）

| 器件 | 匹配性 | 隔离性 | 均分性 | 相位关系 |
|---|---|---|---|---|
| E-T | $S_{11}=S_{22}=0$ | $S_{12}=\pm\tfrac12$（**不隔离**） | $|S_{13}|=|S_{23}|=\tfrac{1}{\sqrt2}$ | 端口 1、2 **反相** |
| H-T | $S_{11}=S_{22}=0$ | $S_{12}=\pm\tfrac12$（**不隔离**） | $|S_{13}|=|S_{23}|=\tfrac{1}{\sqrt2}$ | 端口 1、2 **同相** |
| 魔 T | **四端口全匹配** $S_{ii}=0$ | $S_{12}=S_{34}=0$（**互相隔离**） | $|S_{13}|=|S_{14}|=|S_{23}|=|S_{24}|=\tfrac{1}{\sqrt2}$ | H 臂→1、2 **同相**；E 臂→1、2 **反相** |

> **【考点】**
> **三端口无耗互易网络不能同时匹配。** 设三个端口全匹配（$S_{11}=S_{22}=S_{33}=0$），由幺正条件得 $|S_{12}|^2+|S_{13}|^2=1$、$|S_{12}|^2+|S_{23}|^2=1$、$|S_{13}|^2+|S_{23}|^2=1$，解得 $|S_{12}|^2=|S_{13}|^2=|S_{23}|^2=\tfrac12$；同时正交条件给出 $S_{12}^*S_{13}=0$、$S_{12}^*S_{23}=0$、$S_{13}^*S_{23}=0$，要求三者中至少两个为零，与都为 $\tfrac12$ 矛盾。故**不能同时匹配**——这正是 E-T、H-T 必须"用一臂换匹配"，以及魔 T 需要四个端口才能全匹配的原因。

### 衰减器与移相器的 $[S]$

| 器件 | $[S]$ | 判据 |
|---|---|---|
| 理想衰减器（匹配、有耗） | $S_{11}=S_{22}=0$，$S_{12}=S_{21}=e^{-\alpha l}$ | $|S_{21}|^2+|S_{11}|^2<1$ → **有耗**，幺正性不成立 |
| 理想移相器（匹配、无耗） | $S_{11}=S_{22}=0$，$S_{12}=S_{21}=e^{-j\varphi}$ | $|S_{21}|^2+|S_{11}|^2=1$ → **无耗**，幺正性成立 |

> **【易错点】**
> 衰减器**不满足** $[S]^+[S]=[I]$，这是判别有耗器件的标准依据。看到 $|S_{21}|<1$ 且匹配，就应判定为有耗网络，不要再套用无耗（幺正）的任何结论。

---

## 十、常用数值与工程常数

| 名称 | 数值 |
|---|---|
| 真空光速 | $c=2.998\times10^{8}\ \mathrm{m/s}$（工程取 $3\times10^{8}$） |
| 真空波阻抗 | $\eta_0=120\pi=376.73\ \Omega$ |
| 真空介电常数 | $\varepsilon_0=8.854\times10^{-12}\ \mathrm{F/m}$ |
| 真空磁导率 | $\mu_0=4\pi\times10^{-7}\ \mathrm{H/m}$ |
| 铜电导率 | $\sigma_{\mathrm{Cu}}=5.8\times10^{7}\ \mathrm{S/m}$ |
| 单位换算 | $1\ \mathrm{Np}=8.686\ \mathrm{dB}$；$0\ \mathrm{dBm}=1\ \mathrm{mW}$；$30\ \mathrm{dBm}=1\ \mathrm{W}$ |
| 微波炉频率 | $2.45\ \mathrm{GHz}$（ISM 频段） |
| 标准波导 WR-90 / BJ-100 | $a=22.86\ \mathrm{mm}$，$b=10.16\ \mathrm{mm}$，$f_c(\mathrm{TE}_{10})=6.56\ \mathrm{GHz}$，单模 $6.56\sim13.12\ \mathrm{GHz}$ |
| $\mathrm{TE}_{10}$ 衰减最小频率 | $f\approx\sqrt3 f_c$ 附近（介于 $f_c$ 与 $2f_c$ 之间） |
| 同轴线标准阻抗 | $50\ \Omega$（折中）、$75\ \Omega$（衰减最小）、$30\ \Omega$（功率容量最大） |

---

## 十一、快速自检：看到题目该用哪个公式

| 题目特征 | 首选公式 |
|---|---|
| 给出 $Z_0,Z_l,f,z$，求输入阻抗 | $Z_{\mathrm{in}}=Z_0\dfrac{Z_l+jZ_0\tan\beta z}{Z_0+jZ_l\tan\beta z}$，$\beta=2\pi f\sqrt{\varepsilon_r}/c$ |
| 求反射系数、驻波比 | $\Gamma_l=\dfrac{Z_l-Z_0}{Z_l+Z_0}$、$\rho=\dfrac{1+|\Gamma_l|}{1-|\Gamma_l|}$ |
| 求波腹/波节点位置 | $z_{\max}=\dfrac{\varphi_l\lambda}{4\pi}+\dfrac{n\lambda}{2}$，$z_{\min}=z_{\max}\pm\dfrac{\lambda}{4}$ |
| 判断工作状态 | 比 $Z_l$ 与 $Z_0$；或比 $|\Gamma_l|$ 与 $0,1$ |
| 圆图类题目 | $\bar z=Z/Z_0$，旋转 $\dfrac{z}{\lambda}\times720^\circ$，顺时针向信源 |
| 设计匹配 | 先 $\lambda/4$（$Z_{01}=\sqrt{Z_0R}$）；或单枝节 $l_1,l_2$ 公式 |
| 波导中能否传播某频率 | 算 $\lambda_c$ 并与 $\lambda_0$ 比较；或算 $f_c$ 与 $f$ 比较 |
| 求波导波长、相速、群速 | $\lambda_g=\lambda_0/\sqrt{1-(f_c/f)^2}$，$v_p=c/\sqrt{1-(f_c/f)^2}$，$v_g=c\sqrt{1-(f_c/f)^2}$ |
| 求波导尺寸 | $\dfrac{\lambda}{2}<a<\lambda$，$b=(0.4\sim0.5)a$，单模区 $f_c<f<2f_c$ |
| 求同轴线尺寸 | $Z_0=\dfrac{60}{\sqrt{\varepsilon_r}}\ln\dfrac{b}{a}$；单模 $\lambda>\pi(a+b)$ |
| 微带线设计 | $\varepsilon_e$ 与 $Z_0$ 的两段 Hammerstad 公式；$h$ 上限由 $2h\sqrt{\varepsilon_r}$ 与 $4h\sqrt{\varepsilon_r-1}$ 定 |
| 网络性质判别 | 互易看非对角、对称看对角、无耗看幺正、有耗看 $|S_{21}|<1$ |
| 器件 $[S]$ 矩阵 | 用"对称性 + 互易性 + 幺正性"三件套反解 |
| 证明无耗性 | 用 $[Z]^+=-[Z]$ 或 $[S]^+[S]=[I]$ |
| 证明对称性 | 用 $z_{11}=z_{22}\Rightarrow S_{11}=S_{22}$ |
