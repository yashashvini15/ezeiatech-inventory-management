package com.ezeiatech.inventory.service;

import com.ezeiatech.inventory.dto.ProductRequest;
import com.ezeiatech.inventory.dto.ProductResponse;
import com.ezeiatech.inventory.entity.Category;
import com.ezeiatech.inventory.entity.Product;
import com.ezeiatech.inventory.entity.ProductStatus;
import com.ezeiatech.inventory.entity.Supplier;
import com.ezeiatech.inventory.exception.ApiException;
import com.ezeiatech.inventory.repository.CategoryRepository;
import com.ezeiatech.inventory.repository.ProductRepository;
import com.ezeiatech.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ezeiatech.inventory.util.InputSanitizer;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;

    @Transactional
    public ProductResponse create(ProductRequest req){
        String sku = normalizeSku(req.getSku());
        if(productRepository.existsBySku(sku)){
            throw new ApiException(HttpStatus.CONFLICT, "SKU already exists");
        }
        Product p = new Product();
        apply(p, req, sku);
        p.setStock(req.getStock());
        p.setStatus(ProductStatus.ACTIVE);
        return ProductResponse.from(productRepository.save(p));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req){
        Product p = find(id);
        String sku = normalizeSku(req.getSku());
        if(productRepository.existsBySkuAndIdNot(sku,id)){
            throw new ApiException(HttpStatus.CONFLICT, "SKU already exists");
        }
        apply(p,req,sku);
        return ProductResponse.from(p);
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id){
        return ProductResponse.from(find(id));
    }

    @Transactional
    public void deactivate(Long id){
        find(id).setStatus(ProductStatus.INACTIVE);
    }

    private Product find(Long id){
        return productRepository.findById(id)
                .orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private void apply(Product p, ProductRequest req, String sku){
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND, "Category not found"));

        Supplier supplier = supplierRepository.findById(req.getSupplierId())
                .orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND, "Supplier not found"));
        p.setName(InputSanitizer.clean(req.getName()));
        p.setSku(sku);
        p.setDescription(InputSanitizer.clean(req.getDescription()));
        p.setCategory(category);
        p.setSupplier(supplier);
        p.setPrice(req.getPrice());
        p.setCostPrice(req.getCostPrice());
        p.setReorderLevel(req.getReorderLevel());
    }

    private String normalizeSku(String sku) {
        return InputSanitizer.clean(sku).toUpperCase();
    }
}
