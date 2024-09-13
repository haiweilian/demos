-- 数据范围（1全部数据权限 2自定数据权限 3本部门数据权限 4本部门及以下数据权限 5仅本人数据权限）

-- 1.全部数据权限：不限制查询条件
SELECT * FROM user

-- 2.自定数据权限：从 `sys_role_dept` 表中查出角色分配的部门，再通过 `IN` 查找多个部门的数据
SELECT * FROM user WHERE dept_id IN(SELECT dept_id from role_dept WHERE role_id = 2)

-- 3.部门数据权限：根据 `dept_id` 查询本部门的数据
SELECT * FROM user WHERE dept_id = 2

-- 4.部门及以下数据权限：从 `sys_dept` 表中查出本部门和子部门，再通过 `IN` 查找多个部门的数据
SELECT * FROM user WHERE dept_id IN(SELECT dept_id FROM dept WHERE dept_id = 2 OR FIND_IN_SET(2, ancestors))

-- 5.仅本人数据权限：根据 `user_id` 查询本人的数据
SELECT * FROM user WHERE user_id = 3
