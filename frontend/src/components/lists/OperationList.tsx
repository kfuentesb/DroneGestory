import OperationsTableView from "./OperationsTableView";

export default function OperationList() {
  return (
    <OperationsTableView
      title="Operaciones registradas"
            endpoint="/api/operations"
      emptyText="No hay operaciones registradas."
    />
  );
}
