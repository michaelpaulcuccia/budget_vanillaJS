//IIFE - immediatly invoked function expression  

//***BUDGET CONTROLLER*** 
var budgetController = (function () {

    //Expense Function Constructor
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //Income Function Constructor 
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //calculateBudget() - calculate total income and expenses
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            //value from Expense and Income Function Constructors
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    //Data Structure 
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals : {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    //PUBLIC METHOD ALLOWING OTHER MODULES TO ADD A NEW ITEM TO DATA STRUCTURE

    return {
        addItem: function(type, des, val) {
            
            //declare newItem and ID
            var newItem, ID;

            //Create new ID. ID = last ID + 1
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            } else {
                ID = 0;
            }
            
            //Create new Item based on inc or exp type
            if (type === 'exp'){
                newItem = new Expense(ID, des, val);
            }else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            //type - exp or inc, push newItem to allItems empty array
            data.allItems[type].push(newItem);

            //return the new element 
            return newItem;
        },

        calculateBudget: function() {

            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income that was spent
            //if > 0 and -1 to prevent 'infinity'
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
           

        },

        getBudget: function() {

            //returns an Object
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        //Public Method to Expose internal Data. In console = budgetController.testing()
        testing: function() {
            console.log(data);
        }
    };

})();


//***UI CONTROLLER***
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,  //will be inc or exp 
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) //parseFloat to make string and int.
            }
        },

        //Object is newItem Variable 
        addListItem: function(obj, type) {
            var html, newHTML, element;

            //Create HTML String with placeholder text (single quotes outside if double quotes inside)
            //%id%, %description%, %value%

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element= DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replace the placeholder text with actual data (from object) - from Function Constructor 

            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', obj.value);

            //insert HTML into the DOM
            //https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML

            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
            
        },

            //CLEAR FORM FIELDS 
            clearFields: function() {
                var fields, fieldsArr;

                fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

                //tricks slice method into thinking we have given it an array 
                var fieldsArr = Array.prototype.slice.call(fields);

                //forEach has access to args currentValue, indexNumber, array
                fieldsArr.forEach(function(current, index, array) {
                    current.value = "";
                });

                //returns cursor to input field
                //[0] - input description
                fieldsArr[0].focus();
            },

         displayBudget: function(obj) {

            //the object from getBudget()

            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;
            
            //percentage control 
            if (obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
               document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '---';
            }
         },  

        //MAKES DOMStrings A PUBLIC METHOD
        getDOMstrings: function () {
            return DOMstrings;
        }
    }

})();


//***GLOBAL APP CONTROLLER*** 
var controller = (function (budgetCtrl, UICtrl) {

    //EVENT LISTENER FUNCTIONS
    var setupEventListeners = function () {

        //ACESS TO UIController's DOMstrings
        var DOM = UIController.getDOMstrings();

        //EVENT LISTENER FOR INPUT (CHECK) BUTTON
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        //console.log('Check Button Was Clicked');   

        //KEYPRESS EVENT 
        document.addEventListener('keypress', function (event) {
            //console.log(event);
            if (event.key === 13 || event.which === 13) {
                //console.log('ENTER was pressed.');
                ctrlAddItem();
            }
        });

        //see function for ctrlDeleteItem a few lines down...
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    };  

    var updateBudget = function() {
        //1. Calculate the budget 
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget();

        //3. Display the budget on the UI
        //UIController.displayBudget(budget);
        UICtrl.displayBudget(budget);
    }

    var ctrlAddItem = function () {
        //DECLARE VARIABLES 
        var input, newItem;

        //1. Get the field input data 
        var input = UIController.getInput();
        console.log(input);

        //ENSURE FIELDS HAVE DATA 
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //2. Add item to the budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4. Clear the fields
            UICtrl.clearFields();

            //5. Calculate and Update Budget
            updateBudget();
        }        
        //console.log('Still Working');
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        //has access to event in addEventListener
        //console.log(event.target);
        //console.log(event.target.parentNode);
        //console.log(event.target.parentNode.parentNode.parentNode.parentNode);
        console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            //inc-3
            splitID = itemID.split('-'); // ['inc' '3']
            type = splitID[0]; // 'inc'
            ID = splitID[1]; // '3'
            
            //1. Delete Item from Data Structure

            //2. Delete Item from User Interface

            //3. Update and Show New Budget 
        }
    };

    return {
        init: function () {
            console.log('Application has started');
            UICtrl.displayBudget({
                budget: 0, 
                totalInc: 0,
                totalExp: 0,
                percentage: ''
            });
            setupEventListeners();
        }
    };


})(budgetController, UIController);

controller.init();

