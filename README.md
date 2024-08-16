# CyberDiningHall

**CyberDiningHall** 是一个基于 Flask 和 MySQL 构建的在线点餐系统，旨在为学校的师生提供便捷的食堂点餐服务，提供在线浏览、点餐、订单管理、商户信息管理等功能。

本项目为课程期末PJ，望后人请勿照搬。

## 功能概述

- **用户管理**
  - 用户可以注册、登录，并查看和管理自己的账户信息。
- **商户管理**
  - 商户可以注册、登录，管理自己的信息，发布和更新菜单。
- **点餐系统**
  - 用户可以在线浏览商户的菜品，选择菜品并下单点餐。
- **订单管理**
  - 用户可以查看自己的订单状态和历史订单记录。
- **收藏功能**
  - 用户可以收藏自己喜欢的商户和菜品。
- **评价系统**
  - 用户可以对商户和菜品进行评论和评分。
- **搜索功能**
  - 用户可以搜索商户和菜品，并查看详细信息。
- **管理员功能**
  - 管理员可以管理平台的用户和商户信息。

## 运行环境设置

### 1. 安装必要的 Python 包

确保你的 Python 环境中安装了以下包：

- Flask
- Flask-SQLAlchemy
- pymysql (用于连接 MySQL 数据库)

可以通过运行以下命令来安装这些包：

```bash
pip install Flask Flask-SQLAlchemy pymysql
```

### 2. 数据库配置

- 确保 MySQL 服务正在运行。
- 创建一个名为 `CyberDiningHall` 的数据库（如果尚未创建）：
  ```sql
  CREATE DATABASE CyberDiningHall;
  ```
- 使用以下命令创建一个数据库用户 `super_user` 并设置密码为 `Genshin Impact, activate!`，确保此用户有足够权限操作数据库 `CyberDiningHall`：
  ```sql
  CREATE USER 'super_user'@'localhost' IDENTIFIED BY 'Genshin Impact, activate!';
  GRANT ALL PRIVILEGES ON CyberDiningHall.* TO 'super_user'@'localhost';
  FLUSH PRIVILEGES;
  ```

## 项目结构

```plaintext
CyberDiningHall/
│  app.py                # 主应用文件
│  Database.py           # 数据库操作相关代码
│  test.py               # 测试文件
│  test.zip              # 测试相关文件压缩包
│  utils.py              # 工具函数
│  views.py              # 视图函数
│
├─static                 # 静态资源文件夹
│  ├─css                 # 样式表
│  ├─image               # 图片资源
│  └─js                  # JavaScript 文件
└─templates              # HTML 模板文件
```

## 贡献

欢迎提交 pull request 或 issue 来贡献代码或提供反馈。

## 许可证

该项目采用 [MIT 许可证](LICENSE)。
