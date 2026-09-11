import XCTest
@testable import Nof1Native

final class MutationReceiptTests: XCTestCase {
    func testExplicitFalseIsNotASuccessfulWrite() {
        XCTAssertThrowsError(try MutationReceipt.validate(.object(["success": .bool(false)]))) { error in
            XCTAssertEqual(error as? MutationReceiptError, .recordNotChanged)
        }
    }

    func testConfirmedDeleteIsAccepted() throws {
        try MutationReceipt.validate(.object(["success": .bool(true)]))
    }

    func testRecordAndEntryMutationResponsesAreAccepted() throws {
        try MutationReceipt.validate(.object(["id": .string("arbitrary-record-id"), "isActive": .bool(false)]))
        try MutationReceipt.validate(.object(["deleted": .number(3)]))
        try MutationReceipt.validate(.null)
    }
}
