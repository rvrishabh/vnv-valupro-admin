import {
  useAssignPermissionsMutation,
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useUnassignPermissionMutation,
  useUpdateRoleMutation,
} from "@/api/mutations/roles";
import { usePermissionsQuery } from "@/api/queries/permissions";
import { useRoleQuery, useRolesQuery } from "@/api/queries/roles";
import { AlertPopup } from "@/components/AlertPopup/AlertPopup";
import { DataTable } from "@/components/DataTable/data-table";
import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import FormInput from "@/components/Form/FormInput";
import FormSelect from "@/components/Form/FormSelect";
import { FormTextArea } from "@/components/Form/FormTextArea";
import { Modal } from "@/components/Modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import type { Permission, Role } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconKey, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/roles/")({
  component: RolesPage,
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  loginChannel: z.enum(["WEB", "MOBILE"]),
});
type FormValues = z.infer<typeof formSchema>;

function buildSort(sorting: SortingState): string | undefined {
  const [first] = sorting;
  if (!first) return undefined;
  return `${first.id}:${first.desc ? "desc" : "asc"}`;
}

function RolesPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchText, setSearchText] = useState<string>();
  const [editing, setEditing] = useState<Role | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [permissionsRoleId, setPermissionsRoleId] = useState<string | null>(
    null,
  );

  const listQuery = useRolesQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sort: buildSort(sorting),
    search: searchText,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", loginChannel: "WEB" },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", description: "", loginChannel: "WEB" });
    setModalOpen(true);
  };

  const openEdit = (row: Role) => {
    setEditing(row);
    form.reset({
      name: row.name,
      description: row.description ?? "",
      loginChannel: row.loginChannel,
    });
    setModalOpen(true);
  };

  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();
  const deleteMutation = useDeleteRoleMutation();

  const saveMutation = editing ? updateMutation : createMutation;

  const onSubmit = (values: FormValues) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: values },
        { onSuccess: () => setModalOpen(false) },
      );
    } else {
      createMutation.mutate(values, { onSuccess: () => setModalOpen(false) });
    }
  };

  const columns = useMemo<ColumnDef<Role>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
      },
      {
        accessorKey: "loginChannel",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Channel" />
        ),
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.loginChannel}</Badge>
        ),
      },
      {
        accessorKey: "description",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.description || "—"}
          </span>
        ),
      },
      {
        id: "system",
        header: "",
        cell: ({ row }) =>
          row.original.isSystem ? <Badge>System</Badge> : null,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const isAdmin = row.original.name.toLowerCase() === "admin";
          return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              title={
                isAdmin
                  ? "Admin role permissions cannot be changed"
                  : "Manage permissions"
              }
              disabled={isAdmin}
              onClick={(e) => {
                e.stopPropagation();
                setPermissionsRoleId(row.original.id);
              }}
            >
              <IconKey className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                openEdit(row.original);
              }}
            >
              <IconPencil className="h-4 w-4" />
            </Button>
            {!row.original.isSystem && (
              <AlertPopup
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconTrash className="h-4 w-4 text-destructive" />
                  </Button>
                }
                title="Delete role?"
                cancelAction="Cancel"
                continueAction={
                  <span onClick={() => deleteMutation.mutate(row.original.id)}>
                    Delete
                  </span>
                }
              >
                This will permanently remove "{row.original.name}". Roles
                still referenced by users cannot be deleted.
              </AlertPopup>
            )}
          </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Roles
          </h2>
          <p className="text-sm text-muted-foreground">
            Define roles per login channel and grant them permissions.
          </p>
        </div>
        <Button onClick={openCreate}>
          <IconPlus className="h-4 w-4" />
          New Role
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={listQuery.data?.data ?? []}
        isLoading={listQuery.isLoading}
        toolbar
        searchText={searchText}
        setSearchText={setSearchText}
        pagination={pagination}
        setPagination={setPagination}
        sorting={sorting}
        setSorting={setSorting}
        pageCount={listQuery.data?.totalPages ?? 0}
      />

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit Role" : "New Role"}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 pb-2"
          >
            <FormInput control={form.control} name="name" label="Name" required />
            <FormSelect
              control={form.control}
              name="loginChannel"
              label="Login Channel"
              options={[
                { label: "WEB", value: "WEB" },
                { label: "MOBILE", value: "MOBILE" },
              ]}
            />
            <FormTextArea
              {...form.register("description")}
              label="Description"
              placeholder="Optional description"
              error={form.formState.errors.description?.message}
            />
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </form>
        </Form>
      </Modal>

      <ManagePermissionsModal
        roleId={permissionsRoleId}
        onClose={() => setPermissionsRoleId(null)}
      />
    </div>
  );
}

function ManagePermissionsModal({
  roleId,
  onClose,
}: {
  roleId: string | null;
  onClose: () => void;
}) {
  const roleQuery = useRoleQuery(roleId ?? undefined);
  const permissionsQuery = usePermissionsQuery({ page: 1, limit: 100 });
  const assignMutation = useAssignPermissionsMutation();
  const unassignMutation = useUnassignPermissionMutation();

  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (roleQuery.data) {
      setSelected(
        new Set(
          (roleQuery.data.rolePermissions ?? []).map((rp) => rp.permission.id),
        ),
      );
    }
  }, [roleQuery.data]);

  const grouped = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const permission of permissionsQuery.data?.data ?? []) {
      const list = map.get(permission.resource) ?? [];
      list.push(permission);
      map.set(permission.resource, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [permissionsQuery.data]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isSaving = assignMutation.isPending || unassignMutation.isPending;
  const isAdmin = roleQuery.data?.name.toLowerCase() === "admin";

  const onSave = async () => {
    if (!roleId || isAdmin) return;
    const current = new Set(
      (roleQuery.data?.rolePermissions ?? []).map((rp) => rp.permission.id),
    );
    const toAdd = [...selected].filter((id) => !current.has(id));
    const toRemove = [...current].filter((id) => !selected.has(id));

    if (toAdd.length > 0) {
      await assignMutation.mutateAsync({
        id: roleId,
        data: { permissionIds: toAdd },
      });
    }
    for (const permissionId of toRemove) {
      await unassignMutation.mutateAsync({ id: roleId, permissionId });
    }
    onClose();
  };

  return (
    <Modal
      open={!!roleId}
      onOpenChange={(open) => !open && onClose()}
      title={
        roleQuery.data ? `Permissions — ${roleQuery.data.name}` : "Permissions"
      }
      className="max-w-screen-sm"
    >
      <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pb-2">
        {isAdmin && (
          <p className="text-sm text-muted-foreground">
            The Admin role's permissions cannot be changed.
          </p>
        )}
        {grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No permissions have been created yet.
          </p>
        ) : (
          grouped.map(([resource, permissions]) => (
            <div key={resource} className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {resource}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {permissions.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={selected.has(permission.id)}
                      onCheckedChange={() => toggle(permission.id)}
                      disabled={isAdmin}
                    />
                    {permission.action}
                  </label>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      <Button
        type="button"
        className="w-full mt-2"
        disabled={isSaving || !roleId || isAdmin}
        onClick={onSave}
      >
        {isSaving ? "Saving…" : "Save Permissions"}
      </Button>
    </Modal>
  );
}
