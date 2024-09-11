-- 数据范围（1全部数据权限 2自定数据权限 3本部门数据权限 4本部门及以下数据权限 5仅本人数据权限）

-- 1. 全部数据权限
-- 不限制条件
SELECT * FROM user

-- 2. 自定义数据权限
-- 从 `角色部门表` 查出角色分配的部门，再通过 in 查找多个部门的数据
SELECT * FROM user WHERE dept_id IN(SELECT dept_id from role_dept WHERE role_id = 2)

-- 3. 本部门数据权限
-- 根据自身分配的部门，查询此部门的数据
SELECT * FROM user WHERE dept_id = 2

-- 4. 本部门及以下数据权限
-- 查询自身部门id 和 以下部门id 再通过 in 查找多个部门的数据
SELECT * FROM user WHERE dept_id IN(SELECT dept_id FROM dept WHERE dept_id = 2 OR FIND_IN_SET(2, ancestors))

-- 5. 仅本人数据数据权限
-- 根据 user_id 查询数据
SELECT * FROM user WHERE user_id = 3
