import { test, expect } from '@playwright/test';

test.describe('Rahul Shetty Academy Shopping Flow', () => {
  test('Complete shopping flow: login, add iPhone X to cart, and checkout', async ({ page }) => {
    // Navigate to the login page
    await page.goto('https://rahulshettyacademy.com/loginpagePractise/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Fill login credentials
    await page.locator('#username').fill('rahulshettyacademy');
    await page.locator('#password').fill('Learning@830$3mK2');

    // Check terms and conditions
    await page.locator('#terms').check();

    // Click sign in button
    await page.locator('#signInBtn').click();

    // Wait for either success or error
    await page.waitForTimeout(3000);

    // Check if login was successful by looking for products or error message
    const hasProducts = await page.locator('.card').count() > 0;
    const hasError = await page.locator('.alert-danger').isVisible().catch(() => false);

    if (hasError) {
      console.log('Login failed - checking error message');
      const errorText = await page.locator('.alert-danger').textContent();
      console.log('Error:', errorText);
      throw new Error(`Login failed: ${errorText}`);
    }

    if (!hasProducts) {
      // Try alternative login approach or check current URL
      console.log('Current URL:', page.url());
      console.log('Page title:', await page.title());

      // If we're still on login page, try different credentials or approach
      if (page.url().includes('loginpagePractise')) {
        // Try without selecting user role
        await page.reload();
        await page.locator('#username').fill('rahulshettyacademy');
        await page.locator('#password').fill('Learning@830$3mK2');
        await page.locator('#terms').check();
        await page.locator('#signInBtn').click();
        await page.waitForTimeout(3000);
      }
    }

    // Wait a bit more for products to load
    await page.waitForTimeout(5000);

    // Debug: Check page content
    console.log('Page content check:');
    const bodyText = await page.locator('body').textContent();
    console.log('Body contains "card":', bodyText?.includes('card'));
    console.log('Body contains "product":', bodyText?.includes('product'));

    // Try different selectors for products
    let productsFound = false;
    let productAdded = false;

    // Try multiple selectors for products
    const selectors = [
      '.card',
      '.product',
      '[data-product]',
      '.item',
      '.card-body'
    ];

    for (const selector of selectors) {
      const products = page.locator(selector);
      const count = await products.count();
      console.log(`Selector "${selector}" found ${count} elements`);

      if (count > 0) {
        // Get text content of first few products
        for (let i = 0; i < Math.min(count, 3); i++) {
          const productText = await products.nth(i).textContent();
          console.log(`Product ${i + 1}: ${productText?.substring(0, 100)}...`);
        }
        break;
      }
    }

    // Look for iPhone X product with different approaches
    const iphoneSelectors = [
      '.card:has-text("iphone X")',
      '.card:has-text("iPhone X")',
      '.card:has-text("IPhone X")',
      '[class*="card"]:has-text("iphone")',
      '[class*="product"]:has-text("iphone")'
    ];

    for (const selector of iphoneSelectors) {
      const iphoneProduct = page.locator(selector);
      if (await iphoneProduct.count() > 0) {
        console.log(`Found iPhone with selector: ${selector}`);
        await iphoneProduct.locator('button').filter({ hasText: /add|cart|buy/i }).first().click();
        productAdded = true;
        break;
      }
    }

    // If still no iPhone found, try to add any available product
    if (!productAdded) {
      console.log('iPhone X not found, trying to add first available product...');

      // Look for any "Add to Cart" buttons
      const addButtons = page.locator('button').filter({ hasText: /add.*cart|add|cart|buy/i });
      const buttonCount = await addButtons.count();

      if (buttonCount > 0) {
        console.log(`Found ${buttonCount} "Add to Cart" buttons`);
        await addButtons.first().click();
        productAdded = true;
        console.log('✅ Added first available product to cart');
      } else {
        // Try any button that might be for adding to cart
        const anyButtons = page.locator('button');
        const anyButtonCount = await anyButtons.count();
        console.log(`Found ${anyButtonCount} total buttons on page`);

        if (anyButtonCount > 0) {
          // Get text of all buttons
          const buttonTexts = await anyButtons.allTextContents();
          console.log('Button texts:', buttonTexts);

          // Look for buttons with relevant text
          for (let i = 0; i < anyButtonCount; i++) {
            const text = buttonTexts[i]?.toLowerCase() || '';
            if (text.includes('add') || text.includes('cart') || text.includes('buy')) {
              await anyButtons.nth(i).click();
              productAdded = true;
              console.log(`✅ Clicked button: "${buttonTexts[i]}"`);
              break;
            }
          }
        }
      }
    }

    if (!productAdded) {
      throw new Error('Could not find any product to add to cart');
    }

    // Wait for cart update
    await page.waitForTimeout(2000);

    // Click on Checkout button (look for various possible selectors)
    const checkoutButton = page.locator('a.nav-link.btn.btn-primary').or(
      page.locator('button').filter({ hasText: 'Checkout' })
    ).or(
      page.locator('a').filter({ hasText: 'Checkout' })
    );

    await expect(checkoutButton).toBeVisible();
    await checkoutButton.click();

    // Verify we're on checkout page
    await page.waitForTimeout(2000);

    // Verify product is in the cart
    const cartItem = page.locator('tbody tr').first(); // Get first cart item
    await expect(cartItem).toBeVisible();

    // Debug cart content
    console.log('Cart table HTML:', await page.locator('table').innerHTML());

    // Check all table cells to understand structure
    const allCells = cartItem.locator('td');
    const cellCount = await allCells.count();
    console.log(`Cart has ${cellCount} columns`);

    for (let i = 0; i < cellCount; i++) {
      const cellText = await allCells.nth(i).textContent();
      console.log(`Column ${i + 1}: "${cellText?.trim()}"`);
    }

    // More flexible cart verification - check that we have at least one product row
    const productRows = page.locator('tbody tr').filter({ hasText: 'iphone' });
    await expect(productRows).toHaveCount(1);

    // Check if there's any text mentioning iphone in the cart
    const cartText = await page.locator('table').textContent();
    const hasIphoneInCart = /iphone/i.test(cartText || '');
    console.log('Cart contains iPhone:', hasIphoneInCart);

    if (hasIphoneInCart) {
      console.log('✅ iPhone X verified in cart!');
    } else {
      console.log('⚠️  Cart item found but iPhone not explicitly verified');
    }

    // Verify quantity input exists
    const quantityInput = page.locator('input[type="number"]');
    await expect(quantityInput).toBeVisible();
    console.log('✅ Quantity input verified in cart');

    // Verify total amount is displayed
    const totalAmount = page.locator('h3').filter({ hasText: 'Total' });
    await expect(totalAmount).toBeVisible();

    // Get the actual total value from the next cell
    const totalValue = page.locator('td.text-right h3 strong');
    await expect(totalValue).toBeVisible();

    const totalText = await totalValue.textContent();
    console.log('Total amount:', totalText);
    expect(totalText).toContain('₹');

    console.log('✅ Product successfully added to cart!');
    console.log('✅ Checkout page reached successfully!');
    console.log('✅ Checkout page reached successfully!');
  });
});
