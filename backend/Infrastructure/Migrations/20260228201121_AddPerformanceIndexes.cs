using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Vehicle_Tenant_CreatedAt",
                table: "Vehicles",
                columns: new[] { "TenantId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRecord_Tenant_ArrivalDate",
                table: "ServiceRecords",
                columns: new[] { "TenantId", "ArrivalDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRecord_Tenant_Status",
                table: "ServiceRecords",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRecord_Tenant_VehicleId",
                table: "ServiceRecords",
                columns: new[] { "TenantId", "VehicleId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Vehicle_Tenant_CreatedAt",
                table: "Vehicles");

            migrationBuilder.DropIndex(
                name: "IX_ServiceRecord_Tenant_ArrivalDate",
                table: "ServiceRecords");

            migrationBuilder.DropIndex(
                name: "IX_ServiceRecord_Tenant_Status",
                table: "ServiceRecords");

            migrationBuilder.DropIndex(
                name: "IX_ServiceRecord_Tenant_VehicleId",
                table: "ServiceRecords");
        }
    }
}
