import { institutionTypesApi } from "@/api/institution-types.api";
import { AlertPopup } from "@/components/AlertPopup/AlertPopup";
import { DataTable } from "@/components/DataTable/data-table";
import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import FormInput from "@/components/Form/FormInput";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api-client";
import type { InstitutionType } from "@/types/institution.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/institution-types/")({
  component: InstitutionTypesPage,
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

function buildSort(sorting: SortingState): string | undefined {
  const [first] = sorting;
  if (!first) return undefined;
  return `${first.id}:${first.desc ? "desc" : "asc"}`;
}

function InstitutionTypesPage() {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchText, setSearchText] = useState<string>();
  const [editing, setEditing] = useState<InstitutionType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // GET /institution-types returns a plain (non-paginated) array — fetch a
  // generous limit and let the table render everything without server-side
  // pagination (see the comment in api/institution-types.api.ts).
  const listQuery = useQuery({
    queryKey: ["institution-types", sorting, searchText],
    queryFn: () =>
      institutionTypesApi.list({
        limit: 100,
        sort: buildSort(sorting),
        search: searchText,
      }),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "" },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", description: "" });
    setModalOpen(true);
  };

  const openEdit = (row: InstitutionType) => {
    setEditing(row);
    form.reset({ name: row.name, description: row.description ?? "" });
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      editing
        ? institutionTypesApi.update(editing.id, values)
        : institutionTypesApi.create({
            name: values.name,
            description: values.description,
          }),
    onSuccess: () => {
      toast.success(editing ? "Institution type updated" : "Institution type created");
      queryClient.invalidateQueries({ queryKey: ["institution-types"] });
      setModalOpen(false);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => institutionTypesApi.remove(id),
    onSuccess: () => {
      toast.success("Institution type deleted");
      queryClient.invalidateQueries({ queryKey: ["institution-types"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Unable to delete");
    },
  });

  const columns = useMemo<ColumnDef<InstitutionType>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
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
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
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
              title="Delete institution type?"
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Institution Types
          </h2>
          <p className="text-sm text-muted-foreground">
            Categories institutions are grouped under (e.g. Bank, NBFC).
          </p>
        </div>
        <Button onClick={openCreate}>
          <IconPlus className="h-4 w-4" />
          New Type
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={listQuery.data ?? []}
        isLoading={listQuery.isLoading}
        toolbar
        searchText={searchText}
        setSearchText={setSearchText}
        sorting={sorting}
        setSorting={setSorting}
        hideRowsPerPage
      />

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit Institution Type" : "New Institution Type"}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
            className="space-y-2 pb-2"
          >
            <FormInput control={form.control} name="name" label="Name" required />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full pb-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Optional description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
