import OperationsTableView from "./OperationsTableView";

export default function OperationList() {
  return (
    <OperationsTableView
      title="Operaciones registradas"
      endpoint="/api/auth/operations"
      emptyText="No hay operaciones registradas."
    />
  );
}
