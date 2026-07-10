import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Drawer,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import {
  CopyOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { imsAxios } from "../../axiosInterceptor";
import { usePermissions } from "../../new/permissions/PermissionsContext";
import { rawMenuConfig } from "../../new/Sidebar/menuLoader";

const { Text } = Typography;

/* ------------------------------------------------------------------ */
/* Menu TREE built from menu.json (frontend is the source of truth).   */
/* Only pages (nodes with a path) are permissionable; groups/headings  */
/* are structure only.                                                 */
/* ------------------------------------------------------------------ */
function buildMenuTree() {
  let seq = 0;
  const walk = (items) =>
    (items || [])
      .map((it) => {
        if (!it || !it.key) return null;
        const node = {
          row_key: `${it.key}__${seq++}`, // menu.json has duplicate codes; keep row keys unique
          menu_code: String(it.key),
          label: it.label || String(it.key),
          path: it.path || null,
          isPage: !!it.path,
        };
        if (it.children) {
          const ch = walk(it.children);
          if (ch.length) node.children = ch;
        }
        return node;
      })
      .filter(Boolean);
  return walk([
    ...(rawMenuConfig?.sidebar1?.items || []),
    ...(rawMenuConfig?.sidebar2?.items || []),
  ]);
}

/** Keep nodes matching q (code/label) or having matching descendants. */
function filterTree(nodes, q) {
  if (!q) return nodes;
  return nodes
    .map((n) => {
      const match =
        n.menu_code.toLowerCase().includes(q) ||
        (n.label || "").toLowerCase().includes(q);
      const children = n.children ? filterTree(n.children, q) : undefined;
      if (match) return n; // keep whole subtree
      if (children && children.length) return { ...n, children };
      return null;
    })
    .filter(Boolean);
}

function collectRowKeys(nodes, acc = []) {
  for (const n of nodes || []) {
    acc.push(n.row_key);
    if (n.children) collectRowKeys(n.children, acc);
  }
  return acc;
}

/* ------------------------------------------------------------------ */
/* shared hooks                                                        */
/* ------------------------------------------------------------------ */
function useActions() {
  const [actions, setActions] = useState([]);
  useEffect(() => {
    imsAxios
      .get("/permissions/actions")
      .then((data) => data?.success && setActions(data.data || []))
      .catch(() => {});
  }, []);
  return actions;
}

/* ------------------------------------------------------------------ */
/* Tree-based permission matrix.                                       */
/* Action cells render ONLY on pages (leaf with path) — clean UI.      */
/* ------------------------------------------------------------------ */
function TreeMatrix({ actions, renderPageCell, filter }) {
  const fullTree = useMemo(buildMenuTree, []);
  const q = (filter || "").trim().toLowerCase();
  const tree = useMemo(() => filterTree(fullTree, q), [fullTree, q]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  useEffect(() => {
    // filter active -> expand everything visible; else start collapsed
    setExpandedRowKeys(q ? collectRowKeys(tree) : []);
  }, [q, tree]);

  const columns = [
    {
      title: "Menu",
      dataIndex: "label",
      width: 320,
      render: (label, r) =>
        r.isPage ? (
          <Space size={4}>
            <Tag color="blue">{r.menu_code}</Tag>
            <Text>{label}</Text>
          </Space>
        ) : (
          <Text strong>{label}</Text>
        ),
    },
    ...actions.map((a) => ({
      title: a.label,
      key: a.action_key,
      width: 90,
      align: "center",
      render: (_, r) => (r.isPage ? renderPageCell(r.menu_code, a.action_key) : null),
    })),
  ];

  return (
    <Table
      size="small"
      rowKey="row_key"
      columns={columns}
      dataSource={tree}
      pagination={false}
      expandable={{
        expandedRowKeys,
        onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]),
      }}
      scroll={{ x: 320 + actions.length * 90, y: 480 }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* TAB 1 — Roles                                                       */
/* ------------------------------------------------------------------ */
function RolesTab() {
  const actions = useActions();
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [grants, setGrants] = useState(new Set()); // "menu|action"
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newRoleOpen, setNewRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState({ role_name: "", description: "" });
  const [menuFilter, setMenuFilter] = useState("");
  // Users drawer
  const [drawerRole, setDrawerRole] = useState(null);
  const [drawerUsers, setDrawerUsers] = useState([]);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await imsAxios.get("/permissions/roles");
      if (data?.success) setRoles(data.data || []);
      else message.error(data?.message);
    } catch (e) {
      message.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const selectRole = async (role) => {
    setSelectedRole(role);
    try {
      const data = await imsAxios.get(`/permissions/roles/${role.role_id}/permissions`);
      if (data?.success) {
        setGrants(new Set((data.data || []).map((p) => `${p.menu_code}|${p.action_key}`)));
      }
    } catch (e) {
      message.error("Failed to load role permissions");
    }
  };

  const openUsersDrawer = async (role) => {
    setDrawerRole(role);
    setDrawerLoading(true);
    try {
      const data = await imsAxios.get(`/permissions/roles/${role.role_id}/users`);
      if (data?.success) setDrawerUsers(data.data || []);
      else message.error(data?.message);
    } catch (e) {
      message.error("Failed to load role users");
    } finally {
      setDrawerLoading(false);
    }
  };

  const toggle = (menu, action) => {
    setGrants((prev) => {
      const next = new Set(prev);
      const k = `${menu}|${action}`;
      if (next.has(k)) {
        next.delete(k);
        // 'view' removed -> clear every other action of this page too,
        // since nothing works without view
        if (action === "view") {
          for (const key of [...next]) {
            if (key.startsWith(`${menu}|`)) next.delete(key);
          }
        }
      } else {
        next.add(k);
      }
      return next;
    });
  };

  const saveMatrix = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const permissions = [...grants].map((k) => {
        const [menu_code, action_key] = k.split("|");
        return { menu_code, action_key };
      });
      const data = await imsAxios.put(
        `/permissions/roles/${selectedRole.role_id}/permissions`,
        { permissions }
      );
      data?.success ? message.success("Role permissions saved") : message.error(data?.message);
      loadRoles();
    } catch (e) {
      message.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const createRole = async () => {
    if (!newRole.role_name.trim()) return message.warning("Role name is required");
    try {
      const data = await imsAxios.post("/permissions/roles", newRole);
      if (data?.success) {
        message.success("Role created");
        setNewRoleOpen(false);
        setNewRole({ role_name: "", description: "" });
        loadRoles();
      } else message.error(data?.message);
    } catch (e) {
      message.error(e?.message || "Create failed");
    }
  };

  const deleteRole = async (role) => {
    try {
      const data = await imsAxios.delete(`/permissions/roles/${role.role_id}`);
      if (data?.success) {
        message.success("Role deleted");
        if (selectedRole?.role_id === role.role_id) setSelectedRole(null);
        loadRoles();
      } else message.error(data?.message);
    } catch (e) {
      message.error("Delete failed");
    }
  };

  const checkboxCell = (menu, action) => {
    const hasView = grants.has(`${menu}|view`);
    return (
      <Checkbox
        checked={grants.has(`${menu}|${action}`)}
        disabled={action !== "view" && !hasView}
        onChange={() => toggle(menu, action)}
      />
    );
  };

  return (
    <Row gutter={12}>
      <Col span={7}>
        <Card
          size="small"
          title="Roles"
          extra={
            <Space>
              <Button size="small" icon={<ReloadOutlined />} onClick={loadRoles} />
              <Button
                size="small"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setNewRoleOpen(true)}
              >
                New
              </Button>
            </Space>
          }
        >
          <Table
            size="small"
            rowKey="role_id"
            loading={loading}
            dataSource={roles}
            pagination={false}
            rowClassName={(r) => (r.role_id === selectedRole?.role_id ? "ant-table-row-selected" : "")}
            columns={[
              {
                title: "Role",
                dataIndex: "role_name",
                render: (name, r) => <a onClick={() => selectRole(r)}>{name}</a>,
              },
              {
                title: "Users",
                dataIndex: "user_count",
                width: 60,
                align: "center",
                render: (count, r) => <a onClick={() => openUsersDrawer(r)}>{count}</a>,
              },
              {
                title: "Perms",
                dataIndex: "permission_count",
                width: 60,
                align: "center",
                render: (count, r) => <a onClick={() => selectRole(r)}>{count}</a>,
              },
              {
                title: "",
                width: 60,
                render: (_, r) => (
                  <Popconfirm title="Delete this role?" onConfirm={() => deleteRole(r)}>
                    <Button size="small" danger type="link">
                      Del
                    </Button>
                  </Popconfirm>
                ),
              },
            ]}
          />
        </Card>
      </Col>
      <Col span={17}>
        <Card
          size="small"
          title={
            selectedRole ? `Permission matrix — ${selectedRole.role_name}` : "Select a role"
          }
          extra={
            selectedRole && (
              <Space>
                <Input.Search
                  size="small"
                  placeholder="Filter menus"
                  allowClear
                  onChange={(e) => setMenuFilter(e.target.value)}
                  style={{ width: 200 }}
                />
                <Button
                  size="small"
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={saving}
                  onClick={saveMatrix}
                >
                  Save
                </Button>
              </Space>
            )
          }
        >
          {selectedRole ? (
            <TreeMatrix actions={actions} renderPageCell={checkboxCell} filter={menuFilter} />
          ) : (
            <Text type="secondary">Choose a role on the left to edit its permissions.</Text>
          )}
        </Card>
      </Col>

      {/* Users-of-role drawer */}
      <Drawer
        title={drawerRole ? `Users with role: ${drawerRole.role_name}` : ""}
        open={!!drawerRole}
        onClose={() => setDrawerRole(null)}
        width={480}
      >
        <Table
          size="small"
          rowKey="user_id"
          loading={drawerLoading}
          dataSource={drawerUsers}
          pagination={{ pageSize: 15 }}
          columns={[
            { title: "Name", dataIndex: "user_name" },
            { title: "CRN", dataIndex: "user_id", width: 110 },
            { title: "Department", dataIndex: "department", width: 110 },
          ]}
        />
      </Drawer>

      <Modal
        title="Create role"
        open={newRoleOpen}
        onOk={createRole}
        onCancel={() => setNewRoleOpen(false)}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            placeholder="Role name (e.g. Store User)"
            value={newRole.role_name}
            onChange={(e) => setNewRole((p) => ({ ...p, role_name: e.target.value }))}
          />
          <Input
            placeholder="Description"
            value={newRole.description}
            onChange={(e) => setNewRole((p) => ({ ...p, description: e.target.value }))}
          />
        </Space>
      </Modal>
    </Row>
  );
}

/* ------------------------------------------------------------------ */
/* TAB 2 — Users (role assignment + overrides + copy-from-user)        */
/* ------------------------------------------------------------------ */
function UsersTab() {
  const actions = useActions();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRoleIds, setUserRoleIds] = useState([]);
  const [overrides, setOverrides] = useState(new Map()); // "menu|action" -> ALLOW/DENY
  const [effective, setEffective] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menuFilter, setMenuFilter] = useState("");
  // copy-from-user modal
  const [copyOpen, setCopyOpen] = useState(false);
  const [copySource, setCopySource] = useState(null);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    imsAxios
      .get("/permissions/roles")
      .then((data) => data?.success && setRoles(data.data || []))
      .catch(() => {});
  }, []);

  const searchUsers = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const data = await imsAxios.get("/permissions/users", { params: { search } });
      if (data?.success) setUsers(data.data || []);
      else message.error(data?.message);
    } catch (e) {
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    searchUsers();
  }, [searchUsers]);

  const selectUser = async (u) => {
    setSelectedUser(u);
    setUserRoleIds((u.roles || []).map((r) => r.role_id));
    setEffective(null);
    try {
      const data = await imsAxios.get(`/permissions/users/${u.user_id}/overrides`);
      if (data?.success) {
        const m = new Map();
        for (const o of data.data || []) m.set(`${o.menu_code}|${o.action_key}`, o.effect);
        setOverrides(m);
      }
    } catch (e) {
      message.error("Failed to load overrides");
    }
  };

  const cycleOverride = (menu, action) => {
    // none -> ALLOW -> DENY -> none
    setOverrides((prev) => {
      const next = new Map(prev);
      const k = `${menu}|${action}`;
      const cur = next.get(k);
      if (!cur) next.set(k, "ALLOW");
      else if (cur === "ALLOW") next.set(k, "DENY");
      else next.delete(k);
      return next;
    });
  };

  const saveUser = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const ovr = [...overrides.entries()].map(([k, effect]) => {
        const [menu_code, action_key] = k.split("|");
        return { menu_code, action_key, effect };
      });
      const [r1, r2] = await Promise.all([
        imsAxios.put(`/permissions/users/${selectedUser.user_id}/roles`, {
          role_ids: userRoleIds,
        }),
        imsAxios.put(`/permissions/users/${selectedUser.user_id}/overrides`, {
          overrides: ovr,
        }),
      ]);
      if (r1?.success && r2?.success) {
        message.success("User permissions saved");
        searchUsers();
      } else message.error(r1?.message || r2?.message);
    } catch (e) {
      message.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const copyFromUser = async () => {
    if (!selectedUser || !copySource) return;
    setCopying(true);
    try {
      const data = await imsAxios.post(
        `/permissions/users/${selectedUser.user_id}/copy-from`,
        { source_user_id: copySource }
      );
      if (data?.success) {
        message.success(data.message);
        setCopyOpen(false);
        setCopySource(null);
        // reload target user's data
        const refreshed = await imsAxios.get("/permissions/users", {
          params: { search: selectedUser.user_id },
        });
        const u = (refreshed?.data || []).find((x) => x.user_id === selectedUser.user_id);
        if (u) selectUser(u);
        searchUsers();
      } else message.error(data?.message);
    } catch (e) {
      message.error(e?.message || "Copy failed");
    } finally {
      setCopying(false);
    }
  };

  const previewEffective = async () => {
    if (!selectedUser) return;
    try {
      const data = await imsAxios.get(
        `/permissions/users/${selectedUser.user_id}/effective`
      );
      if (data?.success) setEffective(data.data.permissions || {});
    } catch (e) {
      message.error("Preview failed");
    }
  };

  const overrideCell = (menu, action) => {
    const eff = overrides.get(`${menu}|${action}`);
    return (
      <Tag
        style={{ cursor: "pointer", minWidth: 52, textAlign: "center" }}
        color={eff === "ALLOW" ? "green" : eff === "DENY" ? "red" : "default"}
        onClick={() => cycleOverride(menu, action)}
      >
        {eff || "—"}
      </Tag>
    );
  };

  return (
    <Row gutter={12}>
      <Col span={8}>
        <Card size="small" title="Users">
          <Input.Search
            placeholder="Search name / email / CRN"
            onSearch={searchUsers}
            allowClear
            style={{ marginBottom: 8 }}
          />
          <Table
            size="small"
            rowKey="user_id"
            loading={loading}
            dataSource={users}
            pagination={{ pageSize: 10 }}
            onRow={(r) => ({ onClick: () => selectUser(r), style: { cursor: "pointer" } })}
            rowClassName={(r) =>
              r.user_id === selectedUser?.user_id ? "ant-table-row-selected" : ""
            }
            columns={[
              { title: "Name", dataIndex: "user_name" },
              { title: "CRN", dataIndex: "user_id", width: 110 },
              {
                title: "Roles",
                dataIndex: "roles",
                render: (rs) => (rs || []).map((r) => <Tag key={r.role_id}>{r.role_name}</Tag>),
              },
            ]}
          />
        </Card>
      </Col>
      <Col span={16}>
        {selectedUser ? (
          <Space direction="vertical" style={{ width: "100%" }} size={12}>
            <Card
              size="small"
              title={`Roles — ${selectedUser.user_name} (${selectedUser.user_id})`}
              extra={
                <Space>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => setCopyOpen(true)}
                  >
                    Copy from user
                  </Button>
                  <Button size="small" onClick={previewEffective}>
                    Preview effective
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={saving}
                    onClick={saveUser}
                  >
                    Save
                  </Button>
                </Space>
              }
            >
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Assign roles"
                value={userRoleIds}
                onChange={setUserRoleIds}
                options={roles.map((r) => ({ label: r.role_name, value: r.role_id }))}
              />
            </Card>
            <Card
              size="small"
              title="Overrides — pages only (click: — → ALLOW → DENY → —). Overrides win over roles."
              extra={
                <Input.Search
                  size="small"
                  placeholder="Filter menus"
                  allowClear
                  onChange={(e) => setMenuFilter(e.target.value)}
                  style={{ width: 200 }}
                />
              }
            >
              <TreeMatrix actions={actions} renderPageCell={overrideCell} filter={menuFilter} />
            </Card>
            {effective && (
              <Card size="small" title="Effective permissions (roles + overrides)">
                {Object.keys(effective).length === 0 ? (
                  <Text type="secondary">No permissions.</Text>
                ) : (
                  Object.entries(effective).map(([menu, acts]) => (
                    <div key={menu} style={{ marginBottom: 4 }}>
                      <Tag color="blue">{menu}</Tag>
                      {acts.map((a) => (
                        <Tag key={a}>{a}</Tag>
                      ))}
                    </div>
                  ))
                )}
              </Card>
            )}
          </Space>
        ) : (
          <Card size="small">
            <Text type="secondary">Select a user to manage roles and overrides.</Text>
          </Card>
        )}
      </Col>

      {/* Copy-from-user modal */}
      <Modal
        title={`Copy permissions to ${selectedUser?.user_name || ""}`}
        open={copyOpen}
        onOk={copyFromUser}
        okText="Copy"
        confirmLoading={copying}
        onCancel={() => setCopyOpen(false)}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text type="secondary">
            Target user will get EXACTLY the source user's roles and overrides
            (existing assignments are replaced).
          </Text>
          <Select
            showSearch
            style={{ width: "100%" }}
            placeholder="Select source user"
            value={copySource}
            onChange={setCopySource}
            optionFilterProp="label"
            options={users
              .filter((u) => u.user_id !== selectedUser?.user_id)
              .map((u) => ({
                label: `${u.user_name} (${u.user_id})`,
                value: u.user_id,
              }))}
          />
        </Space>
      </Modal>
    </Row>
  );
}

/* ------------------------------------------------------------------ */
/* TAB 3 — Menu registry (tree view + sync)                            */
/* ------------------------------------------------------------------ */
function MenusTab() {
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState("");
  const fullTree = useMemo(buildMenuTree, []);
  const q = filter.trim().toLowerCase();
  const tree = useMemo(() => filterTree(fullTree, q), [fullTree, q]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  useEffect(() => {
    setExpandedRowKeys(q ? collectRowKeys(tree) : []);
  }, [q, tree]);

  const syncFromMenuJson = async () => {
    setSyncing(true);
    try {
      const items = [
        ...(rawMenuConfig?.sidebar1?.items || []),
        ...(rawMenuConfig?.sidebar2?.items || []),
      ];
      const data = await imsAxios.post("/permissions/menus/sync", { menus: items });
      if (data?.success) message.success(data.message);
      else message.error(data?.message);
    } catch (e) {
      message.error(e?.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card
      size="small"
      title="Menu registry (from menu.json)"
      extra={
        <Space>
          <Input.Search
            size="small"
            placeholder="Filter menus"
            allowClear
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: 200 }}
          />
          <Button type="primary" loading={syncing} onClick={syncFromMenuJson}>
            Sync to database
          </Button>
        </Space>
      }
    >
      <Table
        size="small"
        rowKey="row_key"
        dataSource={tree}
        pagination={false}
        expandable={{
          expandedRowKeys,
          onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]),
        }}
        scroll={{ y: 520 }}
        columns={[
          {
            title: "Menu",
            dataIndex: "label",
            render: (label, r) =>
              r.isPage ? <Text>{label}</Text> : <Text strong>{label}</Text>,
          },
          {
            title: "Code",
            dataIndex: "menu_code",
            width: 140,
            render: (c, r) => (r.isPage ? <Tag color="blue">{c}</Tag> : <Tag>{c}</Tag>),
          },
          { title: "Path", dataIndex: "path", width: 320 },
          {
            title: "Type",
            width: 90,
            render: (_, r) =>
              r.isPage ? <Tag color="green">Page</Tag> : <Tag>Group</Tag>,
          },
        ]}
      />
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* TAB 4 — Access Requests (one-click approve)                         */
/* ------------------------------------------------------------------ */
function RequestsTab() {
  const actions = useActions();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(false);
  // Grant modal: view auto-checked, admin can add more actions before granting
  const [grantReq, setGrantReq] = useState(null);
  const [grantActions, setGrantActions] = useState(new Set(["view"]));
  const [granting, setGranting] = useState(false);

  const load = useCallback(async (st) => {
    setLoading(true);
    try {
      const data = await imsAxios.get("/permissions/requests", { params: { status: st } });
      if (data?.success) setRows(data.data || []);
      else message.error(data?.message);
    } catch (e) {
      message.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load(status);
  }, [load, status]);

  const openGrant = (r) => {
    setGrantReq(r);
    setGrantActions(new Set(["view"]));
  };

  const toggleGrantAction = (key) => {
    if (key === "view") return; // view always granted
    setGrantActions((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const doGrant = async () => {
    if (!grantReq) return;
    setGranting(true);
    try {
      const data = await imsAxios.post(`/permissions/requests/${grantReq.request_id}/approve`, {
        actions: [...grantActions],
      });
      if (data?.success) {
        message.success(data.message);
        setGrantReq(null);
        load(status);
      } else message.error(data?.message);
    } catch (e) {
      message.error("Grant failed");
    } finally {
      setGranting(false);
    }
  };

  const reject = async (r) => {
    try {
      const data = await imsAxios.post(`/permissions/requests/${r.request_id}/reject`);
      if (data?.success) {
        message.success(data.message);
        load(status);
      } else message.error(data?.message);
    } catch (e) {
      message.error("Action failed");
    }
  };

  return (
    <>
      <Card
        size="small"
        title="Access requests"
        extra={
          <Space>
            <Select
              size="small"
              value={status}
              onChange={setStatus}
              style={{ width: 130 }}
              options={[
                { label: "Pending", value: "PENDING" },
                { label: "Approved", value: "APPROVED" },
                { label: "Rejected", value: "REJECTED" },
              ]}
            />
            <Button size="small" icon={<ReloadOutlined />} onClick={() => load(status)} />
          </Space>
        }
      >
        <Table
          size="small"
          rowKey="request_id"
          loading={loading}
          dataSource={rows}
          pagination={{ pageSize: 15 }}
          columns={[
            {
              title: "User",
              dataIndex: "user_name",
              render: (n, r) => (
                <Space size={4}>
                  <Text>{n}</Text>
                  <Tag>{r.user_id}</Tag>
                </Space>
              ),
            },
            {
              title: "Page",
              dataIndex: "menu_label",
              render: (l, r) => (
                <Space size={4}>
                  <Tag color="blue">{r.menu_code}</Tag>
                  <Text>{l || r.path || ""}</Text>
                </Space>
              ),
            },
            { title: "Message", dataIndex: "message", ellipsis: true },
            { title: "Requested", dataIndex: "requested_at", width: 160 },
            ...(status === "PENDING"
              ? [
                  {
                    title: "Action",
                    width: 170,
                    render: (_, r) => (
                      <Space>
                        <Button size="small" type="primary" onClick={() => openGrant(r)}>
                          Grant
                        </Button>
                        <Popconfirm title="Reject this request?" onConfirm={() => reject(r)}>
                          <Button size="small" danger>
                            Reject
                          </Button>
                        </Popconfirm>
                      </Space>
                    ),
                  },
                ]
              : [
                  { title: "Decided by", dataIndex: "decided_by", width: 120 },
                  { title: "Decided at", dataIndex: "decided_at", width: 160 },
                ]),
          ]}
        />
      </Card>

      {/* Grant modal: choose actions (view locked-in) */}
      <Modal
        title={
          grantReq
            ? `Grant access — ${grantReq.user_name} (${grantReq.user_id})`
            : ""
        }
        open={!!grantReq}
        onOk={doGrant}
        okText={`Grant (${grantActions.size})`}
        confirmLoading={granting}
        onCancel={() => setGrantReq(null)}
      >
        {grantReq && (
          <Space direction="vertical" style={{ width: "100%" }} size={12}>
            <div>
              <Tag color="blue">{grantReq.menu_code}</Tag>
              <Text strong>{grantReq.menu_label || grantReq.path || ""}</Text>
            </div>
            {grantReq.message && (
              <Text type="secondary">User message: "{grantReq.message}"</Text>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
              }}
            >
              {actions.map((a) => (
                <Checkbox
                  key={a.action_key}
                  checked={grantActions.has(a.action_key)}
                  disabled={a.action_key === "view"}
                  onChange={() => toggleGrantAction(a.action_key)}
                >
                  {a.label}
                </Checkbox>
              ))}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              View is always included. Selected actions will be granted as
              user-specific ALLOW overrides on this page.
            </Text>
          </Space>
        )}
      </Modal>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function PermissionAdmin() {
  const { can, permissions } = usePermissions();

  if (permissions && !can("SYS-PERM")) {
    return (
      <Card style={{ margin: 16 }}>
        <Text type="danger">You do not have access to Permission Management.</Text>
      </Card>
    );
  }

  return (
    <div style={{ padding: 12 }}>
      <Tabs
        defaultActiveKey="roles"
        items={[
          { key: "roles", label: "Roles & Matrix", children: <RolesTab /> },
          { key: "users", label: "Users & Overrides", children: <UsersTab /> },
          { key: "requests", label: "Access Requests", children: <RequestsTab /> },
          { key: "menus", label: "Menu Registry", children: <MenusTab /> },
        ]}
      />
    </div>
  );
}
