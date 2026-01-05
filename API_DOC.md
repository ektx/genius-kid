# 拼音与数学练习系统 API 文档

http://localhost:3000/api-docs

本文档描述了前后端接口的对应关系、参数格式及返回结果。

## 1. 基础信息
- **Base URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token (JWT)

## 2. 数学模块 (Math)

### 2.1 获取练习记录
- **端点**: `GET /math/practice`
- **参数**:
  - `page` (query, optional): 页码，默认 1
  - `limit` (query, optional): 每页数量，默认 10
- **响应**:
  ```json
  {
    "success": true,
    "data": {
      "rows": [...],
      "total": 50,
      "page": 1,
      "limit": 10
    }
  }
  ```

### 2.2 提交练习记录
- **端点**: `POST /math/practice`
- **请求体**:
  ```json
  {
    "id": "string",
    "date": "string",
    "duration": "string",
    "accuracy": number,
    "settings": {
      "operations": ["add", "sub"],
      "range": 20,
      "type": "2-num",
      "count": 20
    }
  }
  ```

### 2.3 获取关卡进度
- **端点**: `GET /math/progress`
- **响应**:
  ```json
  {
    "success": true,
    "data": [
      { "level_id": 1, "stars": 3, "unlocked": 1 },
      ...
    ]
  }
  ```

### 2.4 更新关卡进度
- **端点**: `POST /math/progress`
- **请求体**:
  ```json
  {
    "levelId": number,
    "stars": number,
    "unlocked": boolean
  }
  ```

## 3. 拼音模块 (Pinyin)
*(待实现)*

## 4. 健康检查
- **端点**: `GET /health`
- **响应**: `{ "status": "ok", "uptime": ..., "memory": ... }`
