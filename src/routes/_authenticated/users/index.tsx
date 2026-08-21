import {
  useApproveUserMutation,
  useCreateUserMutation,
  useDeactivateUserMutation,
  useUpdateUserMutation,
} from "@/api/mutations/users";
import { useRolesQuery } from "@/api/queries/roles";
import { useUsersQuery } from "@/api/queries/users";
import { AlertPopup } from "@/components/AlertPopup/AlertPopup";
import { DataTable } from "@/components/DataTable/data-table";
import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import FormComboBox from "@/components/Form/FormComboBox";
import FormInput from "@/components/Form/FormInput";
import { Modal } from "@/components/Modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconBan, IconCircleCheck, IconPencil, IconPlus } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/users/")({
  component: UsersPage,
});

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email address"),
  roleId: z.string().min(1, "Role is required"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[a-z]/, "Include a lowercase letter")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[0-9]/, "Include a number")
    .regex(/[^a-zA-Z0-9]/, "Include a symbol"),
  mobile: z.string().optional(),
});
const editSchema = createSchema.partial({ password: true, roleId: true });
type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

function buildSort(sorting: SortingState): string | undefined {
  const [first] = sorting;
  if (!first) return undefined;
  return `${first.id}:${first.desc ? "desc" : "asc"}`;
}

function UsersPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchText, setSearchText] = useState<string>();
  const [editing, setEditing] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const listQuery = useUsersQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sort: buildSort(sorting),
    search: searchText,
  });

  const rolesQuery = useRolesQuery({
    page: 1,
    limit: 100,
    loginChannel: "WEB",
  });
  const roleOptions = useMemo(
    () =>
      (rolesQuery.data?.data ?? []).map((role) => ({
        id: role.id,
        name: role.name,
      })),
    [rolesQuery.data],
  );

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", email: "", roleId: "", password: "", mobile: "" },
  });
  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: "", email: "", mobile: "" },
  });

  const openCreate = () => {
    setEditing(null);
    createForm.reset({ name: "", email: "", roleId: "", password: "", mobile: "" });
    setModalOpen(true);
  };

  const openEdit = (row: User) => {
    setEditing(row);
    editForm.reset({
      name: row.name,
      email: row.email,
      mobile: row.mobile ?? "",
    });
    setModalOpen(true);
  };

  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const approveMutation = useApproveUserMutation();
  const deactivateMutation = useDeactivateUserMutation();

  const onCreateSubmit = (values: CreateFormValues) =>
    createMutation.mutate(
      {
        name: values.name,
        email: values.email,
        roleId: values.roleId,
        password: values.password!,
        mobile: values.mobile || undefined,
      },
      { onSuccess: () => setModalOpen(false) },
    );

  const onEditSubmit = (values: EditFormValues) =>
    updateMutation.mutate(
      {
        id: editing!.id,
        data: { name: values.name, mobile: values.mobile || undefined },
      },
      { onSuccess: () => setModalOpen(false) },
    );

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
      },
      {
        id: "role",
        header: "Role",
        cell: ({ row }) => row.original.role?.name ?? "—",
      },
      {
        id: "institution",
        header: "Institution / Branch",
        cell: ({ row }) => {
          const inst = row.original.institution?.name;
          const branch = row.original.branch?.branchName;
          if (!inst && !branch) return "—";
          return [inst, branch].filter(Boolean).join(" / ");
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Badge variant={row.original.isActive ? "default" : "outline"}>
              {row.original.isActive ? "Active" : "Inactive"}
            </Badge>
            {!row.original.isApproved && (
              <Badge variant="destructive">Unapproved</Badge>
            )}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            {!row.original.isApproved && (
              <Button
                variant="ghost"
                size="icon"
                title="Approve"
                onClick={(e) => {
                  e.stopPropagation();
                  approveMutation.mutate(row.original.id);
                }}
              >
                <IconCircleCheck className="h-4 w-4 text-primary" />
              </Button>
            )}
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
            {row.original.isActive && (
              <AlertPopup
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconBan className="h-4 w-4 text-destructive" />
                  </Button>
                }
                title="Deactivate user?"
                cancelAction="Cancel"
                continueAction={
                  <span onClick={() => deactivateMutation.mutate(row.original.id)}>
                    Deactivate
                  </span>
                }
              >
                "{row.original.name}" will lose access to the platform.
              </AlertPopup>
            )}
          </div>
        ),
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
            Users
          </h2>
          <p className="text-sm text-muted-foreground">
            Web portal staff accounts and mobile user approvals.
          </p>
        </div>
        <Button onClick={openCreate}>
          <IconPlus className="h-4 w-4" />
          New Staff User
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
        title={editing ? "Edit User" : "New Staff User"}
      >
        {editing ? (
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-2 pb-2"
            >
              <FormInput control={editForm.control} name="name" label="Name" required />
              <FormInput
                control={editForm.control}
                name="email"
                label="Email"
                disabled
              />
              <FormInput control={editForm.control} name="mobile" label="Mobile" />
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving…" : "Save"}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-2 pb-2"
            >
              <FormInput control={createForm.control} name="name" label="Name" required />
              <FormInput
                control={createForm.control}
                name="email"
                label="Email"
                type="email"
                required
              />
              <FormComboBox
                control={createForm.control}
                name="roleId"
                label="Role"
                placeholder="Select a role"
                required
                options={roleOptions.map((role) => ({
                  label: role.name,
                  value: role.id,
                }))}
              />
              <FormInput
                control={createForm.control}
                name="password"
                label="Password"
                isPassword
                required
                description="Min 8 chars, mixed case, number & symbol"
              />
              <FormInput control={createForm.control} name="mobile" label="Mobile" />
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating…" : "Create Staff User"}
              </Button>
            </form>
          </Form>
        )}
      </Modal>
    </div>
  );
}
