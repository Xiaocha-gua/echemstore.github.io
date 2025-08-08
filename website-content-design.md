# echemstore网站内容设计文档

## 网站基本信息

### 公司信息
- 公司名称： echemstore电化学商城
- 英文名称： echemstore
- 主营业务：电解水制氢、电解二氧化碳、技术咨询服务
- 核心理念：eChemStore作为能源与物质转换领域材料和设备的专业服务者，实时报道领域内科学最前沿动态，关注和分享新材料、新工艺、新技术、新设备等一线科技创新设计、解决方案。
- 英文理念：eChemStore: a pro provider of materials/equipment in energy and substance conversion.

### 联系信息
- 联系人：邱经理 (Mr. Qiu)
- 电话：+86-15680598517
- 邮箱：:sales03@echemstore.cn
- LinkedIn：https://www.linkedin.com/in/qiu-tian-a8b90a365/

## 网站结构与导航

### 主导航菜单
1. 首页 (Home)
2. 业务领域 (Business Areas)
   - 电解制氢技术与产品 (Water Electrolysis Technology & Products)
   - 电解二氧化碳技术与产品 (CO₂ Electrolysis Technology & Products)
   - 技术咨询服务与数据库 (Technical Consulting & Database Services)
3. 联系我们 (Contact Us)

### 语言版本
- 中文版本：index.html
- 英文版本：index-en.html
- 所有页面都有对应的中英文版本

## 首页内容

### 页面标题和描述
- 中文标题：echemstore氢能技术 | 电解制氢系统、CO₂电解技术与专业咨询服务
- 英文标题：echemstore Hydrogen Technology | Water Electrolysis Systems, CO₂ Electrolysis Technology & Professional Consulting


### 业务展示区（三大核心业务）

#### 1. 电解制氢技术与产品
- 中文标题：电解制氢技术与产品
- 英文标题：Water Electrolysis Technology & Products
- 图标：电解制氢技术与产品-new-1.png（默认）/ 电解制氢技术与产品-new-2.png（悬停）

#### 2. 电解二氧化碳技术与产品
- 中文标题：电解二氧化碳技术与产品
- 英文标题：CO₂ Electrolysis Technology & Products



#### 3. 技术咨询服务与数据库
- 中文标题：技术咨询服务与数据库
- 英文标题：Technical Consulting & Database Services


### 信息区域
包含三个部分：
1. 联系我们信息
2. 业务领域链接
3. 留言按钮

## 业务领域详细内容

### 一、电解制氢技术与产品

#### 主要产品类别：
1. **电解水制氢用阴离子交换膜 Hydrergy**
   - 产品图片：电解水制氢用阴离子交换膜Hydrergy.png
   
2. **电解水制氢用复合隔膜 Hydrergy ZSM**
   - 产品图片：电解水制氢用复合隔膜Hydrergy ZSM.png
   
3. **桌面式电解水测试系统**
   - 产品图片：桌面式电解水测试系统.jpg
   
4. **台架式电解水测试系统**
   - 产品图片：台架式电解水测试系统.jpg
   
5. **多通道电解水测试系统**
   - 产品图片：多通道电解水测试系统.jpg

### 二、电解二氧化碳技术与产品

#### 主要产品类别：
1. **电解二氧化碳用阴离子交换膜 Hydrergy**
   - 产品图片：电解水制氢用阴离子交换膜Hydrergy.png
   
2. **单通道电解二氧化碳测试系统**
   - 产品图片：单通道电解二氧化碳测试系统.jpg
   
3. **台架式电解二氧化碳测试系统**
   - 产品图片：台架式电解二氧化碳测试系统.jpg
   
4. **多通道电解二氧化碳测试系统**
   - 产品图片：多通道电解二氧化碳测试系统.jpg

### 三、技术咨询服务与数据库

#### 主要服务类别：
1. **生命周期评估服务 (LCA Service)**
   - 产品图片：hydrergy_LCA.png
   
2. **技术经济性评估 (TEA Service)**
   - 产品图片：hydrergy_TEA.png
   
3. **Hydrergy数据库**
   - 产品图片：hydrergy_data.png

## 功能特性

### 交互功能
1. **语言切换功能**
   - 中英文版本切换
   - 保持页面对应关系

2. **留言功能**
   - 弹窗式留言表单
   - 表单字段：姓名、邮箱、电话、留言内容
   - Web3Forms邮件服务集成
   插入hteml代码如下
   <form action="https://api.web3forms.com/submit" method="POST">

    <!-- Replace with your Access Key -->
    <input type="hidden" name="access_key" value="133deeca-2119-4426-8b8f-e8ce138563d2">

    <!-- Form Inputs. Each input must have a name="" attribute -->
    <input type="text" name="name" required>
    <input type="email" name="email" required>
    <textarea name="message" required></textarea>

    <!-- Honeypot Spam Protection -->
    <input type="checkbox" name="botcheck" class="hidden" style="display: none;">

    <!-- Custom Confirmation / Success Page -->
    <!-- <input type="hidden" name="redirect" value="https://mywebsite.com/thanks.html"> -->

    <button type="submit">Submit Form</button>

</form>

3. **导航功能**
   - 主导航菜单
   - 下拉子菜单
   - 面包屑导航

4. **图片交互**
   - 鼠标悬停图片切换效果
   - 懒加载优化

### 技术功能
1. **SEO优化**
   - 完整的meta标签
   - 结构化数据
   - 页面标题优化

2. **性能优化**
   - 图片懒加载
   - CSS/JS文件版本控制
   - 资源预加载

3. **分析追踪**
   - Google Analytics集成
   - Google Tag Manager

4. **安全性**
   - Content Security Policy
   - 表单验证

## 页面模板结构

### 通用页面元素
1. **顶部通栏**
   - Logo
   - 联系信息（邮箱、电话）
   - 语言切换按钮

2. **主导航栏**
   - 主菜单项
   - 下拉子菜单

3. **页面主体**
   - 内容区域
   - 侧边栏（业务页面）

4. **底部**
   - 分割线
   - 公司理念标语

### 业务页面特有元素
1. **左侧边栏**
   - 业务领域导航
   - 推荐产品展示

2. **主内容区**
   - 产品详情
   - 技术参数
   - 应用场景

## 内容管理

### 图片资源
- 公司Logo：待定
- 联系图标：邮箱.png, 电话.png, 领英.png
- 业务图标：各业务领域的图标文件
- 产品图片：各产品的展示图片

### 文本内容
- 支持中英文双语
- 统一的术语和表达
- SEO友好的描述文本

### 链接结构
- 清晰的URL结构
- 中英文页面对应关系
- 内部链接优化

## 扩展性考虑

### 内容扩展
- 新产品添加流程
- 新业务领域扩展
- 多语言版本支持

### 功能扩展
- 在线询价功能
- 产品搜索功能
- 客户案例展示
- 新闻资讯模块

### 技术扩展
- 响应式设计适配
- 移动端优化
- 第三方服务集成

## 品牌一致性

### 视觉元素
- 统一的色彩方案
- 一致的字体使用
- 标准化的图标风格

### 内容风格
- 专业技术导向
- 简洁明了的表达
- 突出技术优势和专业性

### 用户体验
- 直观的导航结构
- 快速的页面加载
- 便捷的联系方式