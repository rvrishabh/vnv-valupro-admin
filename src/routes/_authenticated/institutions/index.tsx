import {
  useCreateInstitutionMutation,
  useDeleteInstitutionMutation,
  useUpdateInstitutionMutation,
} from "@/api/mutations/institutions";
import { useInstitutionTypesQuery } from "@/api/queries/institution-types";
import { useInstitutionsQuery } from "@/api/queries/institutions";
import { AlertPopup } from "@/components/AlertPopup/AlertPopup";
import { DataTable } from "@/components/DataTable/data-table";
import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import FormComboBox from "@/components/Form/FormComboBox";
import FormInput from "@/components/Form/FormInput";
import { Modal } from "@/components/Modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { Institution } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/institutions/")({
  component: InstitutionsPage,
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  institutionTypeId: z.string().min(1, "Institution type is required"),
});
type FormValues = z.infer<typeof formSchema>;

function buildSort(sorting: SortingState): string | undefined {
  const [first] = sorting;
  if (!first) return undefined;
  return `${first.id}:${first.desc ? "desc" : "asc"}`;
}

function InstitutionsPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchText, setSearchText] = useState<string>();
  const [editing, setEditing] = useState<Institution | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const typesQuery = useInstitutionTypesQuery({ page: 1, limit: 100 });

  const listQuery = useInstitutionsQuery({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sort: buildSort(sorting),
    search: searchText,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", code: "", institutionTypeId: "" },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", code: "", institutionTypeId: "" });
    setModalOpen(true);
  };

  const openEdit = (row: Institution) => {
    setEditing(row);
    form.reset({
      name: row.name,
      code: row.code,
      institutionTypeId: row.institutionTypeId,
    });
    setModalOpen(true);
  };

  const createMutation = useCreateInstitutionMutation();
  const updateMutation = useUpdateInstitutionMutation();
  const deleteMutation = useDeleteInstitutionMutation();

  const saveMutation = editing ? updateMutation : createMutation;

  const onSubmit = (values: FormValues) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: values },
        {
          onSuccess: () => {
            toast.success("Institution updated");
            setModalOpen(false);
          },
        },
      );
    } else {
      createMutation.mutate(values, { onSuccess: () => setModalOpen(false) });
    }
  };

  const toggleActiveMutation = useUpdateInstitutionMutation();
  const toggleActive = (institution: Institution) =>
    toggleActiveMutation.mutate({
      id: institution.id,
      data: { isActive: !institution.isActive },
    });

  const columns = useMemo<ColumnDef<Institution>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
      },
      {
        accessorKey: "code",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Code" />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.code}</span>
        ),
      },
      {
        id: "type",
        header: "Type",
        cell: ({ row }) => row.original.institutionType?.name ?? "—",
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={row.original.isActive ? "default" : "outline"}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              toggleActive(row.original);
            }}
          >
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
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
              title="Delete institution?"
              cancelAction="Cancel"
              continueAction={
                <span onClick={() => deleteMutation.mutate(row.original.id)}>
                  Delete
                </span>
              }
            >
              This will permanently remove "{row.original.name}". This action
              cannot be undone.
            </AlertPopup>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const typeOptions = typesQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Institutions
          </h2>
          <p className="text-sm text-muted-foreground">
            Banks and other lending institutions on the platform.
          </p>
        </div>
        <Button onClick={openCreate}>
          <IconPlus className="h-4 w-4" />
          New Institution
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
        title={editing ? "Edit Institution" : "New Institution"}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 pb-2"
          >
            <FormInput control={form.control} name="name" label="Name" required />
            <FormInput control={form.control} name="code" label="Code" required />
            <FormComboBox
              control={form.control}
              name="institutionTypeId"
              label="Institution Type"
              placeholder="Select a type"
              required
              options={typeOptions.map((type) => ({
                label: type.name,
                value: type.id,
              }))}
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
    </div>
  );
}
