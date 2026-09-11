import Foundation

enum MutationReceiptError: LocalizedError, Equatable {
    case recordNotChanged

    var errorDescription: String? {
        "The server reported that this record was not changed. Refresh your records before trying again."
    }
}

enum MutationReceipt {
    static func validate(_ value: JSONValue) throws {
        if case .object(let fields) = value, case .bool(false)? = fields["success"] {
            throw MutationReceiptError.recordNotChanged
        }
    }
}
