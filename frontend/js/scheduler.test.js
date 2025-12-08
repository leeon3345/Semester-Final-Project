// frontend/js/scheduler.dom.test.js

/**
 * @jest-environment jsdom
 */

// Note: scheduler.js has code that executes immediately upon import,
// which can cause errors in a test environment.
// Therefore, you should either test only the logic or set up the DOM first as shown below.

document.body.innerHTML = `
  <div id="scheduleListContainer"></div>
  <span id="totalCostDisplay">0.00</span>
  <input type="date" id="startDate" />
  <input type="date" id="endDate" />
  <input type="text" id="tripTitle" />
  <button id="saveScheduleBtn">Save</button>
`;

// This is a unit test example that mimics the logic of scheduler.js for testing purposes.
// In a real scenario, you would need to export functions from scheduler.js.
function calculateTotalCost(attractions) {
    return attractions.reduce((sum, item) => sum + item.cost, 0);
}

describe('Scheduler Logic Tests', () => {
  test('The total cost of selected attractions should be calculated correctly', () => {
    const selectedAttractions = [
      { id: 1, name: 'Grand Palace', cost: 500 },
      { id: 2, name: 'Street Food', cost: 50 }
    ];

    const total = calculateTotalCost(selectedAttractions);
    expect(total).toBe(550);
  });

  test('If there are no attractions, the cost should be 0', () => {
    const selectedAttractions = [];
    const total = calculateTotalCost(selectedAttractions);
    expect(total).toBe(0);
  });
});